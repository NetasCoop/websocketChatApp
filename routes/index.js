var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index');
});

router.get('/getUsers', function(req, res){
	User.find({}, function(err, users) {
		res.send(users);
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}

module.exports = router;