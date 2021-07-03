const fs = require("fs");
const mysql = require("mysql2");
const fastcsv = require("fast-csv");

let stream = fs.createReadStream(__dirname + "/food_reviews_csv2.csv");
let csvData = [];
let csvStream = fastcsv
    .parse({ delimiter: ';' })
    .on("data", function (data) {
        csvData.push(data);
    })
    .on("end", function () {
        // remove the first line: header
        csvData.shift();

        // create a new connection to the database
        const connection = mysql.createConnection({
            host: "remotemysql.com",
            user: "Wzw9BzJt3h",
            password: "gigN7PQqht",
            database: "Wzw9BzJt3h"
        });
        csv = csvData.map(e => [e[1], parseInt(e[2]), e[3].replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\d]/gi, "")]);
        // open the connection
        connection.connect(error => {
            if (error) {
                console.error(error);
            } else {
                let query =
                    "INSERT INTO Corpus (productID, label, description) VALUES ?";
                connection.query(query, [csv.slice(0, 67282)], (error, response) => {
                    console.log(error || response);
                });
                connection.query(query, [csv.slice(67283, 134565)], (error, response) => {
                    console.log(error || response);
                });
                connection.query(query, [csv.slice(134566, csv.length - 1)], (error, response) => {
                    console.log(error || response);
                });
            }
        });
    });

stream.pipe(csvStream);
