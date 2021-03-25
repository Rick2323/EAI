const express = require("express");
const router = express.Router();

var corpus = require("../../database/corpus");

router.get("/", async (req, res) => {

    res.render('./pages/listCorpus.ejs', { results: "" })
});

router.post("/", async (req, res) => {

    let { label, limit } = req.body;

    var results = await corpus.getDocuments(label, limit);

    res.render('./pages/listCorpus.ejs', { results: results })
    //res.send(results);
});

router.get("/detail", async (req, res) => {

    res.render('./pages/listCorpusByID.ejs', { results: "" })
});

router.post("/detail", async (req, res) => {

    let { id } = req.body;

    var results = await corpus.getDocument(id);

    res.render('./pages/listCorpusByID.ejs', { results: results })
    //res.send(results);
});

module.exports = router;