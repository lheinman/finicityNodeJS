const express = require('express');
var request = require('request');
const mysql = require('mysql');
const router = express.Router();

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sa',
    database: 'finicity'
});

router.get('/', function (req, res, next) {
    con.query('SELECT * FROM borrowers', function (err, result) {
        if (err) throw err;
        res.send(result);
        console.log(result);
    });
});

router.post('/', function (req, res) {
    const sql = `INSERT INTO borrowers 
    (username, firstName, lastName, month, dayOfMonth, year, emailAddress, address, city, state, zip, phone, ssn) VALUES 
    ("${req.body.username}", "${req.body.firstName}", "${req.body.lastName}",
    "${req.body.month}", "${req.body.dayOfMonth}", "${req.body.year}", 
    "${req.body.emailAddress}", "${req.body.address}", "${req.body.city}", "${req.body.state}", "${req.body.zip}", 
    "${req.body.phone}", "${req.body.ssn}")`;
    // console.log(sql);

    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log('1 record inserted');
    });

    request.get('http://localhost:3000/authenticate',
        function (err, response, token) {
            if (err) throw err;
            console.log("response from authenticate GET: " + token);

            request.post('http://localhost:3000/customers',
                function (err, response, token) {
                    if (err) throw err;
                    console.log("response from customers POST: " + token);
        
                    request.post('http://localhost:3000/consumers',
                        function (err, response, token) {
                            if (err) throw err;
                            console.log("response from authenticate POST: " + token);
                        }
                    );
                }
            );
        }
    );
    
    res.send('1 record inserted');
})

module.exports = router;
