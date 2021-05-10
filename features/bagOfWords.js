let addUniqueTerms = (arr1, arr2) => {
    for (let t2 of arr2) {
        if (!arr1.some(t1 => compareTerms(t1, t2))) {
            arr1.push(t2);
        }
    }

    return arr1;
};

let binaryVector = () => {

};

let compareTerms = (term1, term2) => {
    if (term1.length !== term2.length) return false;

    let sorted1 = term1.sort();
    let sorted2 = term2.sort();

    return sorted1.join('') === sorted2.join('');
}

module.exports.addUniqueTerms = addUniqueTerms;