const express = require('express');
const router = express.Router();

let Article = require('../model/article');
let User = require('../model/user');

// Add route
router.get('/add', ensureAuthenticaed, (req, res, next) => {
    res.render('add_article', {
        title: 'Add article'
    });
});

// Add submit post route
router.post('/add', (req, res, next) => {
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    //Get Errors
    let errors = req.validationErrors();

    if(errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((err) => {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    };
});


//Update submit
router.post('/edit/:id', (req, res, next) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, (err) => {
        if (err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
    
});


// Load edit form
router.get('/edit/:id', ensureAuthenticaed, (req, res, next) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id) {
            req.flash('danger', 'Not authorized!');
            res.redirect('/');
        } else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            });
        }
    });
});

// Delete article

router.delete('/:id', (req, res, next) => {
    if(!req.user._id) {
        res.status(500).send();
    }

    let query = {_id:req.params.id}

    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, (err) => {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });
});

// Get single article
router.get('/:id', (req, res, next) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, (err, user) => {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});

// Access Control  
function ensureAuthenticaed(req, res, next) {
    if(req.isAuthenticated) {
        return next();
    } else {
        req.flash('danger', 'Please, login!');
        res.redirect('/users/login');
    }
}

module.exports = router;