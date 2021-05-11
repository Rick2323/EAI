let addUniqueTerms = (arr1, arr2) => {
    for (let t2 of arr2) {
        if (!arr1.some(t1 => compareTerms(t1, t2))) {
            arr1.push(t2);
        }
    }

    return arr1;
};

let binaryVector = (bow, terms) => {
    let arr = bow;
    for (let i = 0; i < bow.length; i++) {
        if (terms.some(t => t.name === bow[i].name)) {
            arr[i].binary = 1;
        } else {
            arr[i].binary = 0;
        }
    }
    return arr;
};

let compareTerms = (term1, term2) => {
    if (term1.length !== term2.length) return false;

    let sorted1 = term1.sort();
    let sorted2 = term2.sort();

    return sorted1.join('') === sorted2.join('');
}

let numberOfOccurrencesVector = (bow, terms) => {
    let arr = bow;
    for (let i = 0; i < bow.length; i++) {
        let count = terms.filter(t => t.name === bow[i].name).length;
        arr[i].occurences = count;
    }
    return arr;
}

let tfVector = (bow, terms) => {
    let arr = bow;
    for (let i = 0; i < bow.length; i++) {
        let count = terms.filter(t => t.name === bow[i].name).length;
        let total = terms.length;
        let tf = Math.round(((count / total) + Number.EPSILON) * 100) / 100;
        arr[i].tf = tf;
    }
    return arr;
}


let idfVector = (bow, docBoWs) => {
    let arr = bow;
    let n = docBoWs.length;
    for (let i = 0; i < bow.length; i++) {
        let term = bow[i];
        let filteredDocBoWs = docBoWs.filter(docBoW => docBoW.some(t => t.name === term.name && t.occurences > 0));

        let dt = filteredDocBoWs.length;
        let idf = Math.round(((Math.log10(n / dt)) + Number.EPSILON) * 100) / 100;

        docBoWs.map(docBow => docBow.map(t => {
            if (t.name === term.name) {
                t.idf = idf;
            }
            return t;
        }));

        arr[i].idf = idf;
    }
    return arr;
}

let tfidfVector = (bow, docBoWs) => {

    docBoWs.map(docBow => docBow.map(term => {
        term.tfidf = Math.round((term.tf * term.idf + Number.EPSILON) * 100) / 100;
        return term;
    }));

    return bow;
};

let sumVector = (terms) => {
    let term = {};
    term.name = terms[0].name;
    term.binary = terms.map(term => term.binary).reduce((acc, curr) => acc * curr);
    term.occurences = terms.map(term => term.occurences).reduce((acc, curr) => acc + curr);
    term.tf = Math.round(terms.map(term => term.tf).reduce((acc, curr) => acc + curr) * 100)/100;
    term.idf = terms[0].idf;
    term.tfidf = Math.round((term.tf * term.idf) * 100) / 100;
    return term;
};


module.exports.addUniqueTerms = addUniqueTerms;
module.exports.binaryVector = binaryVector;
module.exports.numberOfOccurrencesVector = numberOfOccurrencesVector;
module.exports.tfVector = tfVector;
module.exports.idfVector = idfVector;
module.exports.tfidfVector = tfidfVector;
module.exports.sumVector = sumVector;