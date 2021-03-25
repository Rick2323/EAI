let stemmer = require('stemmer');

module.exports = (str) => {
    let arr = str.split(' ');
    return arr.map(word => stemmer(word)).join(' ');
}