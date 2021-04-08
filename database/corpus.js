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
        }
    };
}