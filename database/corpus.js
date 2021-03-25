const { MongoClient } = require('mongodb');
var config = require('../config.json');


function getDocuments(label, limit) {

    return new Promise((resolve, reject) => {

        MongoClient.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {

            if (err) {
                reject(err)
                db.close();
            }

            const corpus = db.db("EAI").collection("Corpus");

            var query = { "label": label };
            var options = (limit ? { "limit": parseInt(limit) } : {});

            corpus.find(query, options).toArray()
                .then(results => {

                    resolve(results)
                    db.close();
                })
                .catch(error => console.error(error))
        });
    });
}

function getDocument(id) {

    return new Promise((resolve, reject) => {

        MongoClient.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {

            if (err) {
                reject(err)
                db.close();
            }

            const corpus = db.db("EAI").collection("Corpus");

            var query = { "id": id };

            corpus.find(query).toArray().then(results => {

                resolve(results)
                db.close();
            })
                .catch(error => console.error(error))
        });
    });
}

module.exports.getDocuments = getDocuments;
module.exports.getDocument = getDocument;
