/* TERM { 
    "name": "stai",
    "binary": 0,
    "occurrences": 43,
    "tf": 0.84,
    "idf": 0.21,
    "tfidf": 0.1764
} */




var selectKBest = (terms, k, metric) => {

    metrics = ["binary", "occurrences", "tf", "tfidf"]

    if (metrics.includes(metric)) {

        let aux = terms.slice();

        aux.sort((a, b) => compare(a[metric], b[metric]));

        aux.length = k;

        return aux;
    }

    return null;
}

function compare(a, b) {
    if (a < b) {
        return 1;
    }
    if (a > b) {
        return -1;
    }
    return 0;
}




module.exports.selectKBest = selectKBest;