let mysql = require('mysql2');
let config = require('./config');

let connection = mysql.createPool(config).promise();

module.exports = {
    ...require('./corpus')(connection)
};