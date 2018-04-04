const express = require('express');
const mysql = require('mysql');
var request = require('request');
const router = express.Router();

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sa',
    database: 'finicity'
});

router.get('/', function(req, res, next) {
    con.query('SHOW TABLES', function (err, result) {
        if (err) throw err;
        res.send(result);
        console.log(result);
    });
});

router.post('/', function (req, res) {
    con.query('CREATE TABLE token (token CHAR(20), time BIGINT(13))', function (err, result) {
        if (err) throw err;
        console.log("Table created");
        request.post('http://localhost:3000/authenticate',
            function (error, response, body) {
                if (err) throw err;
                console.log("response from authenticate POST: " + body);
            }
        );
    });
    con.query(
        `CREATE TABLE borrowers (id INT(11) NOT NULL AUTO_INCREMENT, username VARCHAR(63), firstName VARCHAR(63),
        lastName VARCHAR(63), month CHAR(2), dayOfMonth CHAR(2), year CHAR(4), emailAddress VARCHAR(63),
        address VARCHAR(63), city VARCHAR(63), state CHAR(2), zip CHAR(5), phone CHAR(13), ssn CHAR(11),
        customer CHAR(8), customerTime BIGINT(13), consumer CHAR(32), consumerTime BIGINT(13),
        report CHAR(13), reportTime BIGINT(13),PRIMARY KEY (id))`, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    res.send("Tables created");
})

router.delete('/', function (req, res) {
    con.query('DROP TABLE token', function (err, result) {
        if (err) throw err;
        console.log('Table dropped');
    });
    con.query('DROP TABLE borrowers', function (err, result) {
        if (err) throw err;
        console.log('Table dropped');
    });
    res.send('Tables dropped');
})

module.exports = router;
