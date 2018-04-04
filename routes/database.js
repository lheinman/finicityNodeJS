const express = require('express');
const mysql = require('mysql');
const router = express.Router();

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sa',
    database: 'finicity'
});

router.get('/', function(req, res, next) {
    con.query('SHOW DATABASES', function (err, result) {
        if (err) throw err;
        res.send(result);
        console.log(result);
    });
});

router.post('/', function (req, res) {
    con.query('CREATE DATABASE finicity', function (err, result) {
        if (err) throw err;
        console.log('Database created');
        res.send('Database created');
    });
})

router.delete('/', function (req, res) {
    con.query('DROP DATABASE finicity', function (err, result) {
        if (err) throw err;
        console.log('Database dropped');
        res.send('Database dropped');
    });
})
  
module.exports = router;
