var mysql = require('mysql');
require("dotenv").config();

var connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PWD,
    database : process.env.DATABASE_NAME
});

connection.connect(function(err) {
    if (err) throw err;
    connection.query('SET GLOBAL connect_timeout=2880000')
    connection.query('SET GLOBAL interactive_timeout=2880000') // max value: 31536000
    connection.query('SET GLOBAL wait_timeout=2880000')
    console.log("Database Connection Established")
});

module.exports = connection;