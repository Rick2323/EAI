let fs = require('fs');
let database = require('../database');
let preprocessing = require('./index');
let counting = require('./counting');

let process = async () => {
    let [result] = await database.getTrainingSet();
    let classes = {
    };

    let happy = result.filter(e => e.label === 'happy').map(e => e.description);
    let nHappy = result.filter(e => e.label === 'not happy').map(e => e.description);

    classes['happy'] = happy.map(e => {
        return { original: e };
    });

    classes['notHappy'] = nHappy.map(e => {
        return { original: e };
    });

    for (let prop in classes) {
        for (let index = 0; index < classes[prop].length; index++) {
            for (let i = 1; i < 3; i++) {
                let element = classes[prop][index];
                let n = await preprocessing(element.original, i);
                let wordCount = counting.words(n.stemmed);
                let characterCount = counting.characters(n.stemmed);

                element['cleaned'] = n.cleaned;
                element['stemmed'] = n.stemmed;
                element['wordCount'] = wordCount;
                element['characterCount'] = characterCount;
                element['n' + i] = n.tokenized;

                classes[prop][index] = element;
            }
        }
    }

    console.log(classes);
    fs.writeFileSync(`${__dirname}\\training-process.txt`, JSON.stringify(classes, null, 4));
};

process();