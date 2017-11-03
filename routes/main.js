var data = require('../data.js');

var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    data.list().then((result) => {
        res.render('index.html', { data: result });
    });
});

router.get('/person/:id', (req, res, next) => {
    data.calendar(req.params.id).then((rr) => {
        data.clocks(req.params.id).then((result) => {
            res.render('person.html', {
                calendata: rr,
                data: result
            });
        });
    })
});

module.exports = router;
