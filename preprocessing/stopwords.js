let stopword = require('stopword');

let removeStopwords = (str) => {
    return stopword.removeStopwords(str.split(' ')).join(' ');
}

module.exports = removeStopwords;