var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var main = require('./routes/main');

var port = 3000;

var app = express();

// view~
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// static~
app.use(express.static(path.join(__dirname, 'public')));

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', main);

app.listen(port, () => console.log('Server listening at ' + port));
