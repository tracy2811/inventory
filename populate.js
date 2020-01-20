#! /usr/bin/env node

// Dotenv
require('dotenv').config();

const async = require('async');
const Tea = require('./models/tea');
const Category = require('./models/category');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let teas = [];
let categories = [];

function teaCreate(name, description, category, price, quantity, callback) {
	let tea = new Tea({ name, description, category, price, quantity, });
	tea.save(function (err) {
		if (err) {
			callback(err, null);
			return;
		}
		console.log('New Tea: ' + tea);
		teas.push(tea);
		callback(null, tea);
	});
}

function categoryCreate(name, description, callback) {
	let category = new Category({ name, description, });
	category.save(function (err) {
		if (err) {
			callback(err, null);
			return;
		}
		console.log('New Category: ' + category);
		categories.push(category);
		callback(null, category);
	});
}

function createTeas(callback) {
	async.parallel([
		function (callback) {
			teaCreate('Tan Cuong Tea', 'The best-known Vietnamese tea, Green tea from Tan Cuong in Thai Nguyen Province', categories[0], 10, 1000, callback);
		},

		function (callback) {
			teaCreate('Lotus Tea', 'Vietnamese green tea flavored with the scent of Lotus', categories[0], 15, 0, callback);
		},

		function (callback) {
			teaCreate('Oolong Tea', 'Exceptional Oolong tea from the northern mountains of Vietnam are smooth, complex, captivating and sure to delight', categories[1], 5, 3000, callback);
		},

	], callback);
}

function createCategories(callback) {
	async.parallel([
		function (callback) {
			categoryCreate('Green Tea', 'Tea from Camellia sinensis leaves and buds that have not undergone the same withering and oxidation process used to make oolong teas and black teas.', callback);
		},

		function (callback) {
			categoryCreate('Oolong Tea', 'Semi-oxidized tea (Camellia sinensis) produced through a process including withering the plant under strong sun and oxidation before curling and twisting', callback);
		},

		function (callback) {
			categoryCreate('Black Tea', 'Tea more oxidized than oolong, green, and white teas; and generally stronger in flavor than other teas', callback);
		},
	], callback);
}

async.series([
	createCategories,
	createTeas,
], function (err, results) {
	if (err) {
		console.log('FINAL ERR: ' + err);
	} else {
		console.log('Teas: ' + teas);
	}

	mongoose.connection.close();
});

