module.exports = (connection) => {
    return {
        getDocuments: (label, limit) => {
            let query = `SELECT * FROM Corpus WHERE label LIKE '${label}' ${limit ? `LIMIT ${limit}` : ''} `;

            return connection.query(query);
        },
        getDocument: (id) => {
            let query = `SELECT * FROM Corpus WHERE id = ?`;

            return connection.execute(query, [id]);
        },
        getTrainingSet: () => {
            let query = `SELECT c.id,
                                c.description,
                                c.browser,
                                c.device,
                                c.label
                        FROM TrainingSet t
                        INNER JOIN Corpus c ON t.idCorpus = c.id;`;

            return connection.query(query);
        },
        deleteTrainingResults: () => {
            let query = 'DELETE FROM BagOfWords WHERE true;';

            return connection.query(query);
        },
        insertTrainingResults: (bow, metric, ngram, label) => {
            let query = 'INSERT INTO BagOfWords(term, binaryValue , occurrences , tf , idf , tfidf , metric , ngram , label)' +
                'VALUES (?,?,?,?,?,?,?,?,?);';

            return connection.execute(query, [
                bow.name,
                bow.binary,
                bow.occurrences,
                bow.tf,
                bow.idf,
                bow.tfidf,
                metric,
                ngram,
                label
            ]);
        },
        deleteKBestResults: () => {
            let query = 'DELETE FROM KBest WHERE true;'
            return connection.query(query);
        },
        insertKBestResults: (kbest, metric, ngram, label) => {
            let query = 'INSERT INTO KBest(term, binaryValue , occurrences , tf , idf , tfidf , metric , ngram , label)' +
                'VALUES (?,?,?,?,?,?,?,?,?);';

                return connection.execute(query, [
                    kbest.name,
                    kbest.binary,
                    kbest.occurrences,
                    kbest.tf,
                    kbest.idf,
                    kbest.tfidf,
                    metric,
                    ngram,
                    label
                ]);
        },
        getKBest: (limit) => {
            let query = 'SELECT * FROM KBest WHERE ';
        }
    };
}