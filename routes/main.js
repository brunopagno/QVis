var data = require('../data.js');

var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    data.then((result) => {
        res.render('index.html', { data: result });
    });
});

module.exports = router;
