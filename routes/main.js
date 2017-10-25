var data = require('../data.js');

var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    data.list().then((result) => {
        res.render('index.html', { data: result });
    });
});

router.get('/clocks/:id', (req, res, next) => {
    data.clocks(req.params.id).then((result) => {
        res.render('clocks.html', { data: result });
    });
});

module.exports = router;
