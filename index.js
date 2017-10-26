var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var main = require('./routes/main');

var port = 3000;

var app = express();

// view~
app.set('views', 'views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// static~
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/css', express.static(path.join(__dirname, 'public/css')));
// app.use('/js', express.static(path.join(__dirname, 'public/js')));

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', main);

app.listen(port, () => console.log('Server listening at ' + port));
