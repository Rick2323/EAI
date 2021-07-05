let classifier = require('./classifier');
let train = require('./train');
let database = require('../database');
let fs = require('fs');

let classifyCosineSimilarity = async () => {

    let [labelResult] = await database.getLabels();
    let labels = labelResult.map(e => e.label);

    let results = {
        classified: [],
        original: []
    }
    
    for(let label of labels){
        let [docResult] = await database.getTestDocuments(label, 50);
        results.original.push({label, docs: docResult});
    }

    let classVectors = await train.calculateClassVectors();
    for (let original of results.original) {
        let label = original.label;
        let predicted = [];
        for (let elem of results.original.filter(e => e.label === label).map(e => e.docs)[0]) {
            let produced = await classifier.cosineSimilarity(elem.description, classVectors);
            predicted.push({
                expected: label,
                produced
            });
        }
        results.classified.push(predicted);
    }

    await fs.writeFileSync('test.json', JSON.stringify(results.classified));

    return results.classified;
};

let classifyBayes = async () => {
    let [labelResult] = await database.getLabels();
    let labels = labelResult.map(e => e.label);

    let [bagOfWords] = await database.getBagOfWords();

    let results = {
        classified: [],
        original: [],
        aPrioriProbabilities: []
    }
    
    for(let label of labels){
        let [docResult] = await database.getTestDocuments(label, 50);
        let aPrioriProbability = await train.calculateAPrioriProbabilities(label);
        results.original.push({label, docs: docResult});
        results.aPrioriProbabilities.push({label, aPrioriProbability });
    }

    for (let original of results.original) {
        let label = original.label;
        let predicted = [];
        for (let elem of results.original.filter(e => e.label === label).map(e => e.docs)[0]) {
            let produced = await classifier.classify(elem.description, bagOfWords, results.aPrioriProbabilities);
            predicted.push({
                expected: label,
                produced
            });
        }
        results.classified.push(predicted);
    }

    await fs.writeFileSync('testBayes.json', JSON.stringify(results.classified, null, 2));
    return results.classified;
}

let classify = async (classifier) => {
    switch(classifier){
        case "Bayes": return await classifyBayes();
        case "Cosine": return await classifyCosineSimilarity();
        default: return await classifyBayes();
    }
}

module.exports.classify = classify;