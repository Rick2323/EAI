let natural = require('natural');
let NGrams = natural.NGrams;

let ngram = (str, n) => {
    return NGrams.ngrams(str, n);
};

module.exports = ngram;