const express = require('express');
const mysql = require('mysql');
var request = require('request');
const os = require('os');
var config = require(os.homedir() + '/.finicity.json');
const router = express.Router();

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sa',
    database: 'finicity'
});

const options = { 
    uri: 'https://api.finicity.com/aggregation/v2/partners/authentication',
    method: 'POST',
    json:
    {
        partnerId: config.partnerId,
        partnerSecret: config.partnerSecret
    },
    headers: 
    {
        'Finicity-App-Key': config.appKey,
        'Accept': 'application/json'
    }
}

router.get('/', function(req, res, next) {
    con.query('SELECT * FROM token', function (err, result) {
        if (err) throw err;
        if (result.length != 1) throw "the number of tokens is not equal to 1";
        if (Date.now() - result[0].time > (2 * 3600 - 10) * 1000) {
                request.put('http://localhost:3000/authenticate',
                function (error, response, body) {
                    if (err) throw err;
                    console.log("response from authenticate PUT: " + body);
                    res.send(body.token);
                }
            );
        } else {
            res.send(result[0].token);
            console.log(result);
        };
    });
});

router.post('/', function (req, res) {
    request(
        options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                con.query(`INSERT INTO token (token, time) VALUES ("${body.token}", "${Date.now()}")`, function (err, result) {
                    if (err) throw err;
                    console.log('1 record inserted');
                    res.send('1 record inserted');
                });
            } else {
                console.log(body);
                res.send(body);
            }
        }
    );
})

router.put('/', function (req, res) {
    con.query('SELECT * FROM token', function (err, result) {
        if (err) throw err;
        if (result.length != 1) throw "the number of tokens is not equal to 1";
        console.log(result[0].token);

        request(
            options,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                    con.query(
                        `UPDATE token SET token = "${body.token}", time = "${Date.now()}" WHERE token = "${result[0].token}"`, 
                        function (err, result) {
                            if (err) throw err;
                            console.log('1 record updated');
                            res.send('1 record updated');
                        }
                    );
                } else {
                    console.log(body);
                    res.send(body);
                }
            }
        );
    });
})

module.exports = router;