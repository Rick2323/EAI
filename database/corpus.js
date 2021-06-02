let createBagOfWords = `CREATE TABLE BagOfWords(
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    binary INT NOT NULL,
    occurrences DECIMAL(3,2) NOT NULL,
    tf DECIMAL(10,3) NOT NULL,
    idf DECIMAL(10,3) NOT NULL,
    tfidf DECIMAL(10,3) NOT NULL,
    metrics TEXT NOT NULL,
    ngrams INT NOT NULL,
    label TEXT NOT NULL
);`;

let createKBest = `CREATE TABLE KBest(
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    binary INT NOT NULL,
    occurrences DECIMAL(3,2) NOT NULL,
    tf DECIMAL(10,3) NOT NULL,
    idf DECIMAL(10,3) NOT NULL,
    tfidf DECIMAL(10,3) NOT NULL,
    metrics TEXT NOT NULL,
    ngrams INT NOT NULL,
    label TEXT NOT NULL
);`;


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
        insertTrainingResults: (classes) => {
            let query = `DROP TABLE IF EXISTS BagOfWords;
                         ${createBagOfWords}
                         INSERT INTO BagOfWords(name, binary , occurrences , tf , idf , tfidf , metrics , ngrams , label)
                         VALUES `;

            for (let label in classes) {
                let bows = classes[label]['bows'];
                for (let ngrams in bows) {
                    let ngram = parseInt(ngrams.replace(/^\D+/g, '')); // Regex que remove tudo menos numeros
                    for (let metric in bows[ngrams]) {
                        let arr = bows[ngrams][metric];
                        query += arr.map(bow => `\n(${bow.name},${bow.binary},${bow.occurrences},
                                    ${bow, tf},${bow.idf},${bow.tfidf},${metric},${ngram},${label}),`);
                    }
                }
            }

            query = query.slice(0, -1) + ';';

            return connection.query(query);
        },
        insertKBestResults: (classes) => {
            let query = `DROP TABLE IF EXISTS KBest;
                         ${createKBest}
                         INSERT INTO KBest(name, binary , occurrences , tf , idf , tfidf , metrics , ngrams , label)
                         VALUES `;

            for (let label in classes) {
                let kbest = classes[label]['KBest'];
                for (let ngrams in kbest) {
                    let ngram = parseInt(ngram.replace(/^\D+/g, '')); // Regex que remove tudo menos numeros
                    for (let metric in kbest[ngrams]) {
                        let arr = kbest[ngrams][metric];
                        query += arr.map(bow => `\n(${bow.name},${bow.binary},${bow.occurrences},
                                    ${bow, tf},${bow.idf},${bow.tfidf},${metric},${ngram},${label}),`);
                    }
                }
            }

            query = query.slice(0, -1) + ';';

            return connection.query(query);
        }
    };
}