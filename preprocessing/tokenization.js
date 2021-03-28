let natural = require('natural');
let NGrams = natural.NGrams;

let ngram = (str, n) => {
    return NGrams.ngrams(str, parseInt(n));
};

module.exports = ngram;