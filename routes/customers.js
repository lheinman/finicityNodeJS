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

            request(
                {
                    uri: 'https://api.finicity.com/aggregation/v1/customers?type=testing',
                    method: 'GET',
                    headers: 
                    {
                        'Finicity-App-Key': config.appKey,
                        'Finicity-App-Token': token,
                        'Accept': 'application/json'
                    }
                },
                function (error, response, finicity) {
                    if (!error && response.statusCode == 200) {
                        console.log(finicity);
                    }
                    res.send(finicity);
                }
            );
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
                // console.log(result);
                        
                request(
                    {
                        uri: 'https://api.finicity.com/aggregation/v1/customers/testing',
                        method: 'POST',
                        json:
                        {
                            username: result[last].username,
                            firstName: result[last].firstName,
                            lastName: result[last].lastName
                        },
                        headers: 
                        {
                            'Finicity-App-Key': config.appKey,
                            'Finicity-App-Token': token,
                            'Accept': 'application/json'
                        }
                    },
                    function (error, response, finicity) {
                        if (!error && response.statusCode == 201) {
                            console.log(finicity);
                            con.query(
                                `UPDATE borrowers SET customer = "${finicity.id}", customerTime = "${finicity.createdDate}" WHERE id = "${result[last].id}"`, 
                                function (err, result) {
                                    if (err) throw err;
                                    console.log('1 record updated');
                                }
                            );
                            res.send("customer created");
                        } else {
                            console.log(finicity);
                            res.send(finicity);
                        }
                    }
                );
            });
        }
    );
});

router.delete('/', function(req, res, next) {
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
                        uri: `https://api.finicity.com/aggregation/v1/customers/${result[last].customer}`,
                        method: 'DELETE',
                        headers: 
                        {
                            'Finicity-App-Key': config.appKey,
                            'Finicity-App-Token': token
                        }
                    },
                    function (error, response, finicity) {
                        if (!error && response.statusCode == 204) {
                            console.log(finicity);
                            con.query(
                                `UPDATE borrowers SET customer = NULL, customerTime = NULL WHERE id = "${result[last].id}"`, 
                                function (err, result) {
                                    if (err) throw err;
                                    console.log('1 record updated');
                                }
                            );
                            res.send("customer deleted");
                        } else {
                            console.log(finicity);
                            res.send(finicity);
                        }
                    }
                );
            });
        }
    );
});

module.exports = router;