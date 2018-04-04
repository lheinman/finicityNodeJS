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

router.get('/report', function(req, res, next) {
    request.get('http://localhost:3000/authenticate',
        function (err, response, token) {
            if (err) throw err;
            console.log("response from authenticate GET: " + token);

            con.query('SELECT * FROM borrowers', function (err, result) {
                if (err) throw err;
                if (result.length < 1) throw "there is no borrower available";
                var last = result.length - 1;
                // console.log(result);

                request(
                    {
                        uri: `https://api.finicity.com/decisioning/v1/consumers/${result[last].consumer}/reports/${result[last].report}`,
                        method: 'GET',
                        headers: 
                        {
                            'Finicity-App-Key': config.appKey,
                            'Finicity-App-Token': token,
                            'Accept': 'application/json'
                        }
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body);
                        }
                        res.send(body);
                    }
                );
            });
        }
    );
});

router.post('/', function(req, res, next) {
    request.get('http://localhost:3000/authenticate',
        function (err, response, token) {
            if (err) throw err;
            console.log("response from authenticate GET: " + token);

            con.query('SELECT * FROM borrowers', function (err, result) {
                if (err) throw err;
                if (result.length < 1) throw "there is no borrower available";
                var last = result.length - 1;
                // console.log(result);

                request(
                    {
                        uri: `https://api.finicity.com/decisioning/v1/consumers/${result[last].consumer}/reports`,
                        method: 'GET',
                        headers: 
                        {
                            'Finicity-App-Key': config.appKey,
                            'Finicity-App-Token': token,
                            'Accept': 'application/json'
                        }
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body);
                            var report = JSON.parse(body).reports[0];
                            con.query(
                                `UPDATE borrowers SET report = "${report.id}", reportTime = "${report.createdDate}" WHERE id = "${result[last].id}"`, 
                                function (err, result) {
                                    if (err) throw err;
                                    res.send("report created");
                                }
                            );
                        } else {
                            res.send(body);
                        }
                    }
                );
            });
        }
    );
});

module.exports = router;