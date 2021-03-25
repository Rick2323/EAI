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
            let query = `SELECT * FROM TrainingSet;`;

            return connection.query(query);
        }
    };
}