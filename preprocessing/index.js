let clean = require('./clean');
let stemming = require('./stemming');
let stopwords = require('./stopwords');
let tokenization = require('./tokenization');

module.exports = async (str, n) => {
    original = stopwords(original);
    let cleaned = clean(original);
    let stemmed = stemming(cleaned);
    let tokenized = tokenization(stemmed, n);
    return {
        cleaned,
        stemmed,
        tokenized
    };
}