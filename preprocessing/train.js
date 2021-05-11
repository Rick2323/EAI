let fs = require('fs');
let database = require('../database');
let preprocessing = require('./index');
let counting = require('./counting');
let bagOfWords = require('../features/bagOfWords');

let process = async () => {
    let [result] = await database.getTrainingSet();
    let classes = {
    };

    let happy = result.filter(e => e.label === 'happy');
    let nHappy = result.filter(e => e.label === 'not happy');

    classes['happy'] = {
        elements: happy.map(e => {
            return {
                docID: e.id,
                original: e.description
            };
        })
    };

    classes['notHappy'] = {
        elements: nHappy.map(e => {
            return {
                docID: e.id,
                original: e.description
            };
        })
    };

    for (let prop in classes) {
        classes[prop]['n1Terms'] = [];
        classes[prop]['n2Terms'] = [];

        for (let index = 0; index < classes[prop].elements.length; index++) {
            for (let i = 1; i < 3; i++) {
                let element = classes[prop].elements[index];
                let n = await preprocessing(element.original, i);
                let wordCount = counting.words(n.stemmed);
                let characterCount = counting.characters(n.stemmed);

                element['cleaned'] = n.cleaned;
                element['stemmed'] = n.stemmed;
                element['wordCount'] = wordCount;
                element['characterCount'] = characterCount;
                element['n' + i] = n.tokenized;

                classes[prop]['n' + i + 'Terms'] = bagOfWords.addUniqueTerms(classes[prop]['n' + i + 'Terms'], JSON.parse(n.tokenized));

                classes[prop].elements[index] = element;
            }
        }
    }

    classes = calculate(classes);
    

    fs.writeFileSync(`${__dirname}\\training-process.txt`, JSON.stringify(classes, null, 4));
};

let calculate = (classes) => {
    for (let prop in classes) {

        let results = {
            n1: [],
            n2: []
        };
        let bows = {
            n1: [],
            n2: []
        };

        for (let index = 0; index < classes[prop].elements.length; index++) {
            for (let i = 1; i < 3; i++) {

                let element = classes[prop].elements[index];
                let nTerms = classes[prop]['n' + i + 'Terms'];

                // Mapeamento
                let docTerms = mapTerms(JSON.parse(element['n' + i]), element.docID);
                bows['n' + i] = mapTerms(nTerms, 0);

                // Calculos
                let docBoW = bows['n' + i].map(e => {
                    let elem = Object.assign({}, e);
                    elem.docID = element.docID;
                    return elem;
                });

                docBoW = bagOfWords.binaryVector(docBoW, docTerms);
                docBoW = bagOfWords.numberOfOccurrencesVector(docBoW, docTerms);
                docBoW = bagOfWords.tfVector(docBoW, docTerms);

                results['n' + i].push(docBoW);
            }
        }

        for (let i = 1; i < 3; i++) {
            let docBoWs = results['n' + i];
            let bow = bows['n' + i];

            bow = bagOfWords.idfVector(bow, docBoWs);
            bow = bagOfWords.tfidfVector(bow, docBoWs);

            bows['n' + i] = bow.map(term => {
                let filtered = docBoWs.map(docBoW => docBoW.find(t => t.name === term.name));
                term = bagOfWords.sumVector(filtered);
                return term;
            });
        }

        classes[prop].bows = bows;
    }

    return classes;
}

let mapTerms = (tokenized, docID) => {
    return tokenized.map(arr => {
        return {
            docID,
            name: arr.sort().join(' '),
            binary: 0,
            occurences: 0,
            tf: 0,
            idf: 0,
            tfidf: 0
        };
    });
}

process();