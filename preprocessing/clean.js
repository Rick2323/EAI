let toLowerCase = (str) => {
    return str.toLowerCase();
}

let trim = (str) => {
    return str.replace(/\s+/gi, " ");
}

let replace = (str) => {
    return str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\d]/gi, "");
}


module.exports = (str) => {
    let lowered = toLowerCase(str);
    let replaced = replace(lowered);
    return trim(replaced);
}