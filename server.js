var express = require('express');
var app = express();

var mongoose = require('mongoose');

var path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

mongoose.connect('mongodb://muser:m0ng0pass!@ds019970.mlab.com:19970/mongotest', function(err) {
	if (err) {
		console.log('connection error', err);
	} else {
		console.log('connection successful');
	}
});

var grainsSchema = mongoose.Schema({
	grains_type: String,
	grains_amount: Number
});

var hopsSchema = mongoose.Schema({
	hops_type: String,
	hops_amount: Number
});

var yeastSchema = mongoose.Schema({
	yeast_type: String,
	yeast_amount: Number
});

var otherSchema = mongoose.Schema({
	other_ingredient: String,
	other_amount: Number
});

var recipeSchema = mongoose.Schema({ 

	beer_name: String,
	beer_style: String,
	beer_abv: Number,
	grains_list: [grainsSchema],
	hops_list: [hopsSchema],
	yeast_list: [yeastSchema],
	other_list: [otherSchema],
	orig_grav: Number,
	final_grav: Number,
	brew_difficulty: String,
	batch_size: Number,
	brew_instructions: String

});

var Recipe = mongoose.model('Recipe', recipeSchema);

/*var blondy = new Recipe({ 

	beer_name: 'Blondy', 
	beer_style: 'Pale Ale',
	beer_abv: 5.3,
	grains_list: [
		{grains_type: "Dark", grains_amount: 2},
		{grains_type: "Light", grains_amount: 3}
	],
	hops_list: [
		{hops_type: "Fruity", hops_amount: 2},
		{hops_type: "Citrus", hops_amount: 3}
	],
	yeast_list: [
		{yeast_type: "Bready", yeast_amount: 2},
		{yeast_type: "Doughy", yeast_amount: 3}
	],
	other_list: [
		{other_ingredient: "Grapefruit", other_amount: 2}
	],
	orig_grav: 1.1,
	final_grav: 1.6,
	brew_difficulty: "Easy",
	batch_size: 3,
	brew_instructions: "Boil it, ferment it, bottle it, drink it all up."	

});*/

/*blondy.save(function(err, blondy) {
	if (err) return console.log('error saving ', err);
});*/

Recipe.find(function(err, recipes) {
	if (err) return console.log(err);
	//console.log(recipes);
});


app.use(express.static('public'));

app.get('/list-recipes', function(req, res) {

	// use mongoose to get all recipes in the database
	Recipe.find(function(err, recipes) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
		    return res.send(err);

		return res.json(recipes); // return all recipes in JSON format
	});
});

app.get('/list-recipes/:recipeID', function(req, res) {


	// use mongoose to get one recipe in the database
	Recipe.findOne({_id: req.query.recipeID}, function(err, recipe) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err) {
		    return res.send(err);
		} else {
			console.log(recipe);
			return res.json(recipe); // return one recipe in JSON format
		}
	});
});

app.post('/new-recipe', function(req, res) {
	console.log(req.body);

	var recipe = new Recipe(req.body);

	recipe.save(function(err, recipe) {
		if (err) {
			return console.log('error saving ', err);
			res.status(500).send('An error occurred');
		} else {
			res.status(202).send(recipe);
		}
	});
});

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.listen(8080, function() {	
	console.log('server started');
});
