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
    console.log("not implemented");
    res.send("not implemented");
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
                        uri: `https://api.finicity.com/connect/v1/generate`,
                        method: 'POST',
                        json:
                        {
                            partnerId: config.partnerId,
                            customerId: result[last].customer,
                            consumerId: result[last].consumer,
                            redirectUri: "https://www.google.com/",
                            type: "voa",
                            fromDate: Date.now(),
                            webhook: config.webhook,
                            webhookContentType: "application/json",
                        },
                        headers: 
                        {
                            'Finicity-App-Key': config.appKey,
                            'Finicity-App-Token': token,
                            'Accept': 'application/json'
                        }
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log("connection created");
                            res.send({
                                customerId: result[last].customer,
                                consumerId: result[last].consumer,
                                finicityConnectUrl: body.link
                            });
                        } else {
                            console.log(body);
                            res.send("error: " + response.statusCode + " - " + finicity);
                        }
                    }
                );
            });
        }
    );
});

module.exports = router;