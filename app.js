const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Express Session Middleware
app.use(session({
    secret: 'lovingtoys',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
})

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg: msg,
        value: value
    };
    }
}));


// Passport Config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});


// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(config.database);
let db=mongoose.connection;

// Check for db errors
db.on('error', (err) => {
    console.log(err);
});

// Check connection
db.once('open', () => {
    console.log('connected to MongoDB');
})

let Article = require('./model/article');

const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res, next) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }    
    });
});

let articles = require('./routes/articles');
app.use('/articles', articles);

let users = require('./routes/users');
app.use('/users', users);

app.listen(PORT, () => {
    console.log(`Dis shit listens to ${PORT}...`)
});





