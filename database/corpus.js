module.exports = (connection) => {
    return {
        getLabels:() => {
            let query = `SELECT DISTINCT label FROM Corpus ORDER BY label ASC`;
            return connection.query(query);
        },
        getDocuments: (label, limit) => {
            let query = `SELECT * FROM Corpus WHERE label LIKE '${label}' ${limit ? `LIMIT ${limit}` : ''} `;

            return connection.query(query);
        },
        getTestDocuments: (label, limit) => {
            let query = `SELECT c.id, c.productID, c.description, c.label
             FROM Corpus c
             WHERE c.id NOT IN (SELECT idCorpus FROM TrainingSet) AND label LIKE '${label}' ${limit ? `LIMIT ${limit}` : ''} `;

             return connection.query(query);
        },
        getDocument: (id) => {
            let query = `SELECT * FROM Corpus WHERE id = ?`;

            return connection.execute(query, [id]);
        },
        getTrainingSet: () => {
            let query = `SELECT c.id,
                                c.productID,
                                c.description,
                                c.label
                        FROM TrainingSet t
                        INNER JOIN Corpus c ON t.idCorpus = c.id;`;

            return connection.query(query);
        },
        deleteTrainingResults: () => {
            let query = 'DELETE FROM BagOfWords WHERE true;';

            return connection.query(query);
        },
        insertTrainingResults: (bulk) => {
            let query = 'INSERT INTO BagOfWords(term, binaryValue , occurrences , tf , idf , tfidf , metric , ngram , label)' +
                'VALUES ?';

            return connection.query(query, [bulk]);
        },
        deleteKBestResults: () => {
            let query = 'DELETE FROM KBest WHERE true;'
            return connection.query(query);
        },
        insertKBestResults: (bulk) => {
            let query = 'INSERT INTO KBest(term, binaryValue , occurrences , tf , idf , tfidf , metric , ngram , label)' +
                'VALUES ?';

            return connection.query(query, [bulk]);
        },
        getKBest: (ngram, metric, label, k) => {
            let rankingMetric = metric;
            if (metric === 'binaryValue') metric = 'binary'

            let query = `SELECT 
                    id,
                    term,
                    binaryValue,
                    tf,
                    occurrences,
                    tfidf,
                    metric,
                    ngram,
                    label,
                    RANK() OVER(ORDER BY ${rankingMetric} DESC) position
                FROM KBest
                WHERE ngram = ? AND metric LIKE ? AND label LIKE ?
                LIMIT ?`;

            return connection.query(query, [ngram, metric, label, k]);
        }
    };
}