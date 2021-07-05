const express = require("express");
const router = express.Router();

var database = require("../../database");
var preprocessing = require("../../preprocessing");

router.get("/", async (req, res) => {
    res.render('./pages/listCorpus.ejs', { results: "" })
});

router.post("/", async (req, res) => {

    let { label, limit } = req.body;

    var [results] = await database.getDocuments(label, limit);

    res.render('./pages/listCorpus.ejs', { results })
});

router.get("/detail", async (req, res) => {

    res.render('./pages/listCorpusByID.ejs', { results: "" })
});

router.post("/detail", async (req, res) => {

    let { id } = req.body;

    var [results] = await database.getDocument(id);

    res.render('./pages/listCorpusByID.ejs', { results })
});

router.get("/preprocessing", async (req, res) => {

    res.render('./pages/preprocessing.ejs', { results: "" })
});

router.post("/preprocessing", async (req, res) => {

    let { original, n } = req.body;

    var results = await preprocessing(original, n);

    res.render('./pages/preprocessing.ejs', { results })
});

router.get("/KBest", async (req, res) => {
    res.render('./pages/listKBest.ejs', { results: "" })
});

router.post("/KBest", async (req, res) => {

    let { kUnigram, KBigram } = req.body;

    kUnigram = parseInt(kUnigram);
    KBigram = parseInt(KBigram);

    let [labelsResult] = await database.getLabels();
    let labels = labelsResult.map(e => e.label);
    let results = [];

    for (let label of labels) {
        let [uniBinary] = await database.getKBest(1, 'binaryValue', label, kUnigram);
        let [uniOccurrences] = await database.getKBest(1, 'occurrences', label, kUnigram);
        let [uniTf] = await database.getKBest(1, 'tf', label, kUnigram);
        let [uniTfIdf] = await database.getKBest(1, 'tfidf', label, kUnigram);

        let [biBinary] = await database.getKBest(2, 'binaryValue', label, KBigram);
        let [biOccurrences] = await database.getKBest(2, 'occurrences', label, KBigram);
        let [biTf] = await database.getKBest(2, 'tf', label, KBigram);
        let [biTfIdf] = await database.getKBest(2, 'tfidf', label, KBigram);

        results = results.concat(uniBinary)
        results = results.concat(uniOccurrences)
        results = results.concat(uniTf)
        results = results.concat(uniTfIdf)

        results = results.concat(biBinary)
        results = results.concat(biOccurrences)
        results = results.concat(biTf)
        results = results.concat(biTfIdf)
    }

    console.log(results)

    res.render('./pages/listKBest.ejs', { results });
});

router.get("/confusionMatrix", async (req, res) => {
    res.render('./pages/confusionMatrix.ejs', { results: "" })
});

module.exports = router;