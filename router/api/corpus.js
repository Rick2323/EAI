const express = require("express");
const router = express.Router();

var database = require("../../database");

router.get("/", async (req, res) => {

    res.render('./pages/listCorpus.ejs', { results: "" })
});

router.post("/", async (req, res) => {

    let { label, limit } = req.body;

    var [results] = await database.getDocuments(label, limit);

    res.render('./pages/listCorpus.ejs', { results: results })
    //res.send(results);
});

router.get("/detail", async (req, res) => {

    res.render('./pages/listCorpusByID.ejs', { results: "" })
});

router.post("/detail", async (req, res) => {

    let { id } = req.body;

    var [results] = await database.getDocument(id);

    res.render('./pages/listCorpusByID.ejs', { results: results })
    //res.send(results);
});

module.exports = router;