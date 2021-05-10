let fs = require('fs');
let database = require('../database');
let preprocessing = require('./index');
let counting = require('./counting');
let bagOfWords = require('../features/bagOfWords');

let process = async () => {
    let [result] = await database.getTrainingSet();
    let classes = {
    };

    let happy = result.filter(e => e.label === 'happy').map(e => e.description);
    let nHappy = result.filter(e => e.label === 'not happy').map(e => e.description);

    classes['happy'] = {
        elements: happy.map(e => {
            return { original: e };
        })
    };

    classes['notHappy'] = {
        elements: nHappy.map(e => {
            return { original: e };
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

                classes[prop]['n' + i + 'Terms'] = bagOfWords.addUniqueTerms(classes[prop]['n' + i + 'Terms'], JSON.parse(tokenized));

                classes[prop].elements[index] = element;
            }
        }
    }

    for (let index = 0; index < classes[prop].elements.length; index++) {
        for (let i = 1; i < 3; i++) {
            let docTerms = mapTerms(n.tokenized);

            // Calculos
            // Cada documento vai ter todas as palavras que existem no BoW e os respectivos calculos
            // No BoW é fazer a soma dos calculos dos documentos
        }
    }

    fs.writeFileSync(`${__dirname}\\training-process.txt`, JSON.stringify(classes, null, 4));
};

let mapTerms = (tokenized) => {
    let parsed = JSON.parse(tokenized);
    return parsed.map(arr => {
        return {
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