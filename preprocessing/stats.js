let database = require('../database');

/*
{
    classes : [1,2,3,4,5],
    matrix : [[5,2,0,2,4],
              [3,3,2,5,3],
              [0,1,11,7,2],
              [1,3,8,7,2],
              [6,6,6,5,1]]
}

    obj.matrix[2][2]
*/

let confusionMatrix = async (cls) => {
    let [res] = await database.getLabels();
    let labels = res.map(e => e.label);
    let matrix = [];
    let classification = [].concat.apply([], cls);
    for (let predicted of labels) {
        let row = [];
        for (let actual of labels) {
            let value = classification.filter(e => e.expected === actual && e.produced.class === predicted).length;
            row.push(value);
        }
        matrix.push(row);
    }

    return { classes: labels, matrix };
};

/*
{
    classes : [1,2,3,4,5],
    matrix : [[5,2,0,2,4],
              [3,3,2,5,3],
              [0,1,11,7,2],
              [1,3,8,7,2],
              [6,6,6,5,1]]
}

Precision = True Positive / (True Positive + False Positive)
*/
let precision = async (confusionMatrix) => {
    let precisions = [];
    let matrix = confusionMatrix.matrix;
    for (let i = 0; i < matrix.length; i++) {
        let tp = matrix[i][i];
        let fp = matrix[i].reduce((a, b) => a + b) - matrix[i][i];
        let precision = tp / (tp + fp);
        precisions.push({ class: i + 1, precision });
    }
    return precisions;
};


/*
{
    classes : [1,2,3,4,5],
    matrix : [[5,2,0,2,4],
              [3,3,2,5,3],
              [0,1,11,7,2],
              [1,3,8,7,2],
              [6,6,6,5,1]]
}

Recall = True Positive / (True Positive + False Negative)
*/
let recall = async (confusionMatrix) => {
    let recalls = [];
    let matrix = confusionMatrix.matrix;
    for (let i = 0; i < matrix.length; i++) {
        let tp = 0;
        let fn = 0;
        for (let j = 0; j < matrix.length; j++) {
            if (i === j) {
                tp += matrix[j][i];
            } else {
                fn += matrix[j][i];
            }
        }
        let recall = tp / (tp + fn);
        recalls.push({ class: i + 1, recall });
    }
    return recalls;
};

/*
{
    classes : [1,2,3,4,5],
    matrix : [[5,2,0,2,4],
              [3,3,2,5,3],
              [0,1,11,7,2],
              [1,3,8,7,2],
              [6,6,6,5,1]]
}

F1 = 2 x [(Precision x Recall) / (Precision + Recall)]
*/

let fMeasure = async (confusionMatrix, prec, rec) => {
    let precisions = (prec !== undefined && this.prec !== 0) ? prec : precision(confusionMatrix);
    let recalls = (rec !== undefined && this.rec !== 0) ? rec : recall(confusionMatrix);
    let fscores = [];
    for (let i = 0; i < confusionMatrix.matrix.length; i++) {
        let fscore = 2 * ((precisions[i] * recalls[0]) / (precisions[0] + recalls[0]));
        fscores.push({ class: i + 1, fscores });
    }
    return fscore;
};

module.exports.confusionMatrix = confusionMatrix;
module.exports.precision = precision;
module.exports.recall = recall;
module.exports.fMeasure = fMeasure;