let fs = require('fs');
let database = require('../database');
let preprocessing = require('./index');
let counting = require('./counting');
let bagOfWords = require('../features/bagOfWords');
let featureSelection = require('../features/featureSelection');

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

    classes['not happy'] = {
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
    classes = KBest(classes);

    await insertTrainingResults(classes);
    await insertKBestResults(classes);

    fs.writeFileSync(`${__dirname}\\training-process.txt`, JSON.stringify(classes, null, 4));

    return classes;
};

let writeTopKBestToFile = async () => {
    let labels = ["happy", "not happy"];
    let ngrams = [1, 2];
    let results = {};
    let limit = 50;

    for (let label of labels) {
        for (let ngram of ngrams) {
            let [tfIdf] = await database.getKBest(ngram, 'tfidf', label, limit);
            results[label] = Object.assign({}, results[label], {
                ['n' + ngram]: {
                    tfidf: tfIdf.sort((a, b) => a.position > b.position)
                }
            });
        };
    }

    fs.writeFileSync(`${__dirname}\\kbest.json`, JSON.stringify(results, null, 4));
}

let insertTrainingResults = async (classes) => {
    await database.deleteTrainingResults();

    let bulk = [];

    for (let label in classes) {
        let bows = classes[label]['bows'];
        for (let ngrams in bows) {
            let ngram = parseInt(ngrams.replace(/^\D+/g, '')); // Regex que remove tudo menos numeros
            for (let metric in bows[ngrams]) {
                let arr = bows[ngrams][metric];
                for (let bow of arr) {
                    bulk.push([
                        bow.name,
                        bow.binary,
                        bow.occurrences,
                        bow.tf,
                        bow.idf,
                        bow.tfidf,
                        metric,
                        ngram,
                        label
                    ]);
                }
            }
        }
    }

    let [insertTrainingResults] = await database.insertTrainingResults(bulk);
};

let insertKBestResults = async (classes) => {
    await database.deleteKBestResults();

    let bulk = [];

    for (let label in classes) {
        let kbests = classes[label]['KBest'];
        for (let ngrams in kbests) {
            let ngram = parseInt(ngrams.replace(/^\D+/g, '')); // Regex que remove tudo menos numeros
            for (let metric in kbests[ngrams]) {
                let arr = kbests[ngrams][metric];
                for (let kbest of arr) {
                    // let [insertKBestResults] = await database.insertKBestResults(bow, metric, ngram, label);
                    bulk.push([
                        kbest.name,
                        kbest.binary,
                        kbest.occurrences,
                        kbest.tf,
                        kbest.idf,
                        kbest.tfidf,
                        metric,
                        ngram,
                        label
                    ]);
                }
            }
        }
    }

    let [insertKBestResults] = await database.insertKBestResults(bulk);
};

let KBest = (classes) => {
    for (let prop in classes) {

        let KBest = {}

        for (let i = 1; i < 3; i++) {

            var sum = classes[prop].bows['n' + i].sum

            KBest['n' + i] = {
                "binary": featureSelection.selectKBest(sum, "binary"),
                "occurrences": featureSelection.selectKBest(sum, "occurrences"),
                "tf": featureSelection.selectKBest(sum, "tf"),
                "tfidf": featureSelection.selectKBest(sum, "tfidf")
            }
        }

        classes[prop].KBest = KBest;
    }

    return classes;
};

let calculate = (classes) => {
    for (let prop in classes) {
        let results = {}, bows = {};
        for (let i = 1; i < 3; i++) {

            results['n' + i] = [];
            bows['n' + i] = {};

            for (let index = 0; index < classes[prop].elements.length; index++) {


                let element = classes[prop].elements[index];
                let nTerms = classes[prop]['n' + i + 'Terms'];

                // Mapeamento
                let docTerms = mapTerms(JSON.parse(element['n' + i]), element.docID);
                bows['n' + i].sum = mapTerms(nTerms, 0);
                bows['n' + i].avg = mapTerms(nTerms, 0);

                // Calculos
                let docBoW = bows['n' + i].sum.map(e => {
                    let elem = Object.assign({}, e);
                    elem.docID = element.docID;
                    return elem;
                });

                docBoW = bagOfWords.binaryVector(docBoW, docTerms);
                docBoW = bagOfWords.numberOfOccurrencesVector(docBoW, docTerms);
                docBoW = bagOfWords.tfVector(docBoW, docTerms);

                results['n' + i].push(docBoW);
            }

            let docBoWs = results['n' + i];
            let bow = bows['n' + i].sum;

            bow = bagOfWords.idfVector(bow, docBoWs);
            bow = bagOfWords.tfidfVector(bow, docBoWs);

            bows['n' + i].sum = bow.map(term => {
                let filtered = docBoWs.map(docBoW => docBoW.find(t => t.name === term.name));
                term = bagOfWords.sumVector(filtered);
                return term;
            });

            bows['n' + i].avg = bow.map(term => {
                let filtered = docBoWs.map(docBoW => docBoW.find(t => t.name === term.name));
                term = bagOfWords.avgVector(filtered);
                return term;
            });

            classes[prop].bows = bows;
        }
    }

    return classes;
};

let mapTerms = (tokenized, docID) => {
    return tokenized.map(arr => {
        return {
            docID,
            name: arr.sort().join(' '),
            binary: 0,
            occurrences: 0,
            tf: 0,
            idf: 0,
            tfidf: 0
        };
    });
};

let run = async () => {
    let classes = await process();
    await writeTopKBestToFile();

    
};

let calculateClassVectors = async () => {
    let classes = await process();
    let classVectors={
    };
    
    for(let label in classes){
        classVectors[label] = {
            bows: classes[label].bows
        };
    }

    return classVectors
}

// run();

module.exports.calculateClassVectors = calculateClassVectors; 