let classifier = require('./classifier');
let train = require('./train');
let database = require('../database');
let fs = require('fs');

let test = async () => {
    let [happy] = await database.getTestDocuments('happy', 50);
    let [notHappy] = await database.getTestDocuments('not happy', 50);

    let results = {
        original: {
            happy,
            notHappy
        },
        classified: []
    };

    let classVectors = await train.calculateClassVectors();
    for (let label in results.original) {
        let predicted = [];
        for (let doc of results.original[label]) {
            let produced = await classifier.cosineSimilarity(doc.description, classVectors);
            predicted.push({
                expected: label,
                produced
            });
        }
        results.classified.push(predicted);
    }

    await fs.writeFileSync('test.json', JSON.stringify(results));
};

test();