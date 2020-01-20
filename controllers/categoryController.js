const Category = require('../models/category');
const Tea = require('../models/tea');

const async = require('async');
const validator = require('express-validator');

// Display category list on GET
exports.categoryList = function (req, res, next) {
	Category.find()
		.sort([['name', 'ascending']])
		.exec(function (err, listCategories) {
			if (err) {
				return next(err);
			}
			res.render('categoryList', { title: 'Category List', categories: listCategories, });
		});
};

// Display category details on GET
exports.categoryDetail = function (req, res, next) {
	async.parallel({
		category: function (callback) {
			Category.findById(req.params.id)
				.exec(callback);
		},
		teas: function (callback) {
			Tea.find({ 'category': req.params.id, })
				.exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.category == null) {
			const err = new Error('Category not found');
			err.status = 404;
			return next(err);
		}
		res.render('categoryDetail', { title: `Category: ${results.category.name}`, category: results.category, teas: results.teas, });
	});
};

// Display category create form on GET
exports.categoryCreateGet = function (req, res, next) {
	res.render('categoryForm', { title: 'Create New Category', });
};

// Handle category create on POST
exports.categoryCreatePost = [
	// Validate fields
	validator.body('name', 'Category name required').isLength({ min: 1, }).trim(),
	validator.body('description', 'Category description required').isLength({ min: 1, }).trim(),

	// Sanitize fields
	validator.sanitizeBody('*').escape(),

	// Process request after validation and sanitization
	function (req, res, next) {
		// Extract the validationn errors from a request
		const errors = validator.validationResult(req);

		// Create a category with escaped and trimmed data
		const category = new Category({
			name: req.body.name,
			description: req.body.description,
		});

		if (!errors.isEmpty()) {
			res.render('categoryForm', { title: 'Create New Category', category, errors: errors.array(), });
			return;
		}

		// Check if category with same name already exists
		Category.findOne({ 'name': req.body.name, })
			.exec(function (err, foundCategory) {
				if (err) {
					return next(err);
				}

				if (foundCategory) {
					res.redirect(foundCategory.url);
				}

				category.save(function (err) {
					if (err) {
						return next(err);
					}

					res.redirect(category.url);
				});
			});
	},
];

// Display category delete form on GET
exports.categoryDeleteGet = function (req, res, next) {
	async.parallel({
		category: function (callback) {
			Category.findById(req.params.id)
				.exec(callback);
		},
		teas: function (callback) {
			Tea.find({'category': req.params.id, })
				.exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.category == null) {
			res.redirect('/catalog/categories');
		}
		res.render('categoryDelete', { title: `Delete Category: ${results.category.name}`, category: results.category, teas: results.teas, });
	});
};

// Handle category delete on POST
exports.categoryDeletePost = function (req, res, next) {
	async.parallel({
		category: function (callback) {
			Category.findById(req.params.id)
				.exec(callback);
		},
		teas: function (callback) {
			Tea.find({'category': req.params.id, })
				.exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.teas.length) {
			res.render('categoryDelete', { title: `Delete Category: ${results.category.name}`, category: results.category, teas: results.teas, });
			return;
		}
		Category.findByIdAndRemove(req.params.id, function (err) {
			if (err) {
				return next(err);
			}
			res.redirect('/catalog/categories');
		});
	});

};

// Display category update form on GET
exports.categoryUpdateGet = function (req, res, next) {
	Category.findById(req.params.id)
		.exec(function (err, category) {
			if (err) {
				return next(err);
			}
			if (category == null) {
				const err = new Error('Category not found');
				err.status = 404;
				return next(err);
			}
			res.render('categoryForm', { title: `Update Category: ${category.name}`, category, });
		});
};

// Handle category update on POST
exports.categoryUpdatePost = [
	// Validate fields
	validator.body('name', 'Category name required').isLength({ min: 1, }).trim(),
	validator.body('description', 'Category description required').isLength({ min: 1, }).trim(),

	// Sanitize fields
	validator.sanitizeBody('*').escape(),

	// Process request after validation and sanitization
	function (req, res, next) {
		// Extract the validationn errors from a request
		const errors = validator.validationResult(req);

		// Create a category with escaped and trimmed data
		const category = new Category({
			name: req.body.name,
			description: req.body.description,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			res.render('categoryForm', { title: 'Create New Category', category, errors: errors.array(), });
			return;
		}

		// Check if category with same name already exists
		Category.findByIdAndUpdate(req.params.id, category, {}, function (err, theCategory) {
			if (err) {
				return next(err);
			}
			res.redirect(theCategory.url);
		});
	},
];

