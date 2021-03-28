let clean = require('./clean');
let stopwords = require('./stopwords');
let stemming = require('./stemming');
let tokenization = require('./tokenization');

module.exports = async (original, n) => {
    original = stopwords(original);
    let cleaned = clean(original);
    let stemmed = stemming(cleaned);
    let tokenized = tokenization(stemmed, n);
    return {
        cleaned,
        stemmed,
        tokenized : JSON.stringify(tokenized)
    };
}