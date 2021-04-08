let tokenization = require('./tokenization');

let words = (str) => {
    let words = str.split(' ');
    return words.length;
};

let characters = (str) => {
    let words = str.split(' ');
    let sum = words.map(e => e.length).reduce((a, b) => a + b);
    return sum;
};

let numberOfOccurrences = (term, str) => {
    let tokenized = tokenization(str, term.length);
    let filtered = tokenized.filter(e => e.join('') === term.join(''));
    return filtered.length;
};

let exists = (term, str) => {
    return str.includes(term);
};

let tf = (term, str) => {
    let number = numberOfOccurrences(term, str);
    let total = tokenization(str, term.length).length;
    let tf = Math.round(number * 100 / total) / 100;
    return tf;
};

let idf = (n, dt) => {
    return (Math.round(Math.log10(n / dt) * 100)) / 100;
};

let tfidf = (tf, idf) => {
    return Math.round(tf * idf * 100) / 100;
};

module.exports = {
    words,
    characters,
    numberOfOccurrences,
    exists,
    tf,
    idf,
    tfidf
}