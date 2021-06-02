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

    let { kUnigram, nKBigram } = req.body;

    let [uniBinary] = await database.getKBest(1, 'binaryValue', kUnigram);
    let [uniOccurrences] = await database.getKBest(1, 'ocurrences', kUnigram);
    let [uniTf] = await database.getKBest(1, 'tf', kUnigram);
    let [uniTfIdf] = await database.getKBest(1, 'tfidf', kUnigram);

    let [biBinary] = await database.getKBest(2, 'binaryValue', nKBigram);
    let [biOccurrences] = await database.getKBest(2, 'ocurrences', nKBigram);
    let [biTf] = await database.getKBest(2, 'tf', nKBigram);
    let [biTfIdf] = await database.getKBest(2, 'tfidf', nKBigram);

    res.render('./pages/listKBest.ejs', {
        uniBinary,
        uniOccurrences,
        uniTf,
        uniTfIdf,
        biBinary,
        biOccurrences,
        biTf,
        biTfIdf
    });
});

module.exports = router;