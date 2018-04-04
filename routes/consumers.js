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

router.get('/', function(req, res, next) {
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
                        uri: `https://api.finicity.com/decisioning/v1/customers/${result[last].customer}/consumer`,
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

router.get('/', function(req, res, next) {
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
                        uri: `https://api.finicity.com/decisioning/v1/customers/${result[last].customer}/consumer`,
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

router.post('/', function (req, res) {
    request.get('http://localhost:3000/authenticate',
        function (err, response, token) {
            if (err) throw err;
            console.log("response from authenticate GET: " + token);

            con.query('SELECT * FROM borrowers', function (err, result) {
                if (err) throw err;
                if (result.length < 1) throw "there is no borrower available";
                var last = result.length - 1;
                console.log(result);

                request(
                    {
                        uri: `https://api.finicity.com/decisioning/v1/customers/${result[last].customer}/consumer`,
                        method: 'POST',
                        json: 
                        {
                            firstName: result[last].firstName,
                            lastName: result[last].lastName,
                            address: result[last].address,
                            city: result[last].city,
                            state: result[last].state,
                            zip: result[last].zip,
                            phone: result[last].phone,
                            ssn: result[last].ssn,
                            birthday:
                            {
                                year: result[last].year,
                                month: result[last].month,
                                dayOfMonth: result[last].dayOfMonth,
                            },
                            email: result[last].emailAddress,
                        },
                        headers: 
                        {
                            'Finicity-App-Key': config.appKey,
                            'Finicity-App-Token': token,
                            'Accept': 'application/json'
                        }
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 201) {
                            console.log(body);
                            var finicity = JSON.parse(body);
                            con.query(
                                `UPDATE borrowers SET consumer = "${finicity.id}", consumerTime = "${finicity.createdDate}" WHERE id = "${result[last].id}"`, 
                                function (err, result) {
                                    if (err) throw err;
                                    res.send("consumer created");
                                }
                            );
                        } else {
                            console.log("error: " + body);
                        }
                        res.send(body);
                    }
                );
            });
        }
    );
});

module.exports = router;