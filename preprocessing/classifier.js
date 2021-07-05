let preprocessing = require('./index');
let bagOfWordsFeatures = require('../features/bagOfWords');
const database = require('../database');
let train = require('./train');

let cosineSimilarity = async (str, classVectors) => {
    let n = 1;
    let preprocessed = await preprocessing(str, n);
    let tokenized = preprocessed.tokenized;
    let ngrams = mapTerms(JSON.parse(tokenized));

    // Distinct ngrams
    let distinctNGrams = Array.from(new Set(ngrams.map(ngram => ngram.name)))
        .map(name => Object.assign({}, ngrams.find(ngram => ngram.name === name)));

    distinctNGrams = bagOfWordsFeatures.tfVector(distinctNGrams, ngrams);

    let cosineSimilarities = [];
    for (let label in classVectors) {
        let classVector = classVectors[label];
        let tfidfArray = tfidfVector(distinctNGrams, classVector.bows["n" + 1].avg);
        let cosineSimilarity = calculateCosineSimilarity(tfidfArray, classVector.bows["n" + 1].avg);
        cosineSimilarities.push({ class: parseInt(label), probability: cosineSimilarity });
    }

    return checkMaxCosineSimilarity(cosineSimilarities);
};

let calculateCosineSimilarity = (documentVector, bagOfWordsVector) => {
    let sumAB = 0;
    let sumASqrd = 0;
    let sumBSqrd = 0;

    for (let i = 0; i < documentVector.length; i++) {
        sumAB += documentVector[i].tfidf * bagOfWordsVector[i].tfidf;
        sumASqrd += Math.pow(documentVector[i].tfidf, 2);
        sumBSqrd += Math.pow(bagOfWordsVector[i].tfidf, 2);
    }

    let sumASqrdSqrt = Math.sqrt(sumASqrd);
    let sumBSqrdSqrt = Math.sqrt(sumBSqrd);

    let product = sumASqrdSqrt * sumBSqrdSqrt;

    let similarity = Math.round(((sumAB / product) + Number.EPSILON) * 1000) / 1000;
    return similarity;
};

let checkMaxCosineSimilarity = (arr) => {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        let sim = arr[i];
        if (sim.cosineSimilarity > max.cosineSimilarity) {
            max = sim;
        }
    }
    return max;
};

let tfidfVector = (documentDistincNGrams, bagOfWords) => {
    let arr = [];
    for (let ngram of bagOfWords) {
        if (documentDistincNGrams.map(e => e.name).includes(ngram.name)) {
            let idf = ngram.idf;
            let tf = documentDistincNGrams.find(e => e.name === ngram.name).tf;
            arr.push({ name: ngram.name, tfidf: idf * tf });
        } else {
            arr.push({ name: ngram.name, tfidf: 0 });
        }
    }
    return arr;
};

let mapTerms = (tokenized) => {
    return tokenized.map(arr => {
        return {
            name: arr.sort().join(' '),
            binary: 0,
            occurrences: 0,
            tf: 0,
            idf: 0,
            tfidf: 0
        };
    });
};

let classify = async (str, bagOfWords, aPrioriProbabilities) => {
    let labels = Array.from(new Set(bagOfWords.map(e => e.label)));

    let n = 1;
    let preprocessed = await preprocessing(str, n);
    let tokenized = preprocessed.tokenized;
    let ngrams = mapTerms(JSON.parse(tokenized));


    let calculations = await calculateBayesProbabilities(labels, ngrams, bagOfWords, aPrioriProbabilities);

    return calculations.sort((a, b) => (a.probability < b.probability) ? 1 : -1)[0];
};

let calculateBayesProbabilities = async (labels, ngrams, bagOfWords, aPrioriProbabilities) => {
    // Distinct ngrams
    let distinctTerms = Array.from(new Set(ngrams.map(ngram => ngram.name)));
    let numberOfUniqueTerms = Array.from(new Set(bagOfWords.map(e => e.term))).length;

    let arr = [];
    let labelCount = {};
    for (let label of labels) {
        let sum = bagOfWords.filter(e => e.label === label && e.metric === 'sum').map(e => parseInt(e.occurrences)).reduce((a, b) => a + b);

        let v = numberOfUniqueTerms;
        let laplace = 1 / (sum + v);

        labelCount[label] = {
            sum,
            laplace
        };
    }

    for (let term of distinctTerms) {

        for (let label of labels) {
            let occurrences = bagOfWords.filter(e => e.label === label && e.term === term && e.metric === "sum").map(e => parseInt(e.occurrences));

            let probability = (occurrences.length > 0) ?
                parseInt(occurrences[0]) / labelCount[label].sum :
                labelCount[label].laplace;

            arr.push({ class: label, probability });
        }
    }

    let calculations = [];

    for (let label of labels) {
        let aPrioriProbability = aPrioriProbabilities.find(e => e.label === label).aPrioriProbability;
        let probabilityProduct = arr.filter(c => c.class === label).map(e => e.probability).reduce((a, b) => a * b);
        calculations.push({ class: label, probability: probabilityProduct * aPrioriProbability });
    }

    return calculations;
};

module.exports.cosineSimilarity = cosineSimilarity;
module.exports.classify = classify;