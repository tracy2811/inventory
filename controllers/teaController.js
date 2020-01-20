const Tea = require('../models/tea');
const Category = require('../models/category');

const async = require('async');
const validator = require('express-validator');

const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'public/images/uploads', });

exports.index = function (req, res, next) {
	async.parallel({
		teaCount: function(callback) {
			Tea.countDocuments({}, callback);
		},
		categoryCount: function(callback) {
			Category.countDocuments({}, callback);
		},
	}, function (err, results) {
		if (err) {
			return next(err);
		}

		res.render('index', { title: 'Vietnamese Tea Home', data: results, });
	});
};

// Display list of all teas
exports.teaList = function(req, res, next) {
	Tea.find()
		.exec(function (err, teas) {
			if (err) {
				return next(err);
			}
			res.render('teaList', { title: 'Tea List', teas, });
		});
};

// Display detail page for a specific tea
exports.teaDetail = function(req, res, next) {
	Tea.findById(req.params.id)
		.populate('category')
		.exec(function (err, tea) {
			if (err) {
				return next(err);
			}
			if (tea === null) {
				const err = new Error('Tea not found');
				err.status = 404;
				return next(err);
			}
			res.render('teaDetail', { title: `Tea: ${tea.name}`, tea, });
		});
};

// Display tea create form on GET
exports.teaCreateGet = function (req, res, next) {
	Category.find()
		.exec(function (err, categories) {
			if (err) {
				return next(err);
			}
			res.render('teaForm', { title: 'Create New Tea', categories, });
		});
};

// Handle tea create on POST
exports.teaCreatePost = [
	upload.single('picture'),

	// Validate fields
	validator.body('name', 'Tea name required').isLength({ min: 1, }).trim(),
	validator.body('description', 'Tea description required').isLength({ min: 1, }).trim(),
	validator.body('category', 'Tea category required').isLength({ min: 1, }).trim(),
	validator.body('price', 'Tea price must be a positive number').isInt({ min: 1, }).trim(),
	validator.body('quantity', 'Tea quantity must not be a negative number').isInt({ min: 0, }).trim(),

	// Sanitize fields
	validator.sanitizeBody('name').escape(),
	validator.sanitizeBody('description').escape(),
	validator.sanitizeBody('category').escape(),
	validator.sanitizeBody('price').toInt(),
	validator.sanitizeBody('quantity').toInt(),

	// Process request after validation and sanitization
	function (req, res, next) {
		// Extract the validation errors from request
		const errors = validator.validationResult(req);

		const tea = new Tea({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			quantity: req.body.quantity,
		});

		if (req.file) {
			tea.picture = req.file.path.slice(6);
		}

		if (!errors.isEmpty()) {
			Category.find()
				.exec(function (err, categories) {
					if (err) {
						return next(err);
					}
					res.render('teaForm', { title: 'Create New Tea', tea, categories,});
					return;
				});
		}

		tea.save(function (err) {
			if (err) {
				return next(err);
			}
			res.redirect(tea.url);
		});
	},
];

// Display tea delete form on GET
exports.teaDeleteGet = function (req, res, next) {
	Tea.findById(req.params.id)
		.exec(function (err, tea) {
			if (err) {
				return next(err);
			}
			if (tea == null) {
				res.redirect('/catalog/teas');
			}
			res.render('teaDelete', { title: `Delete Tea: ${tea.name}`, tea, });
		});
};

// Handle tea delete on POST
exports.teaDeletePost = function (req, res, next) {
	Tea.findByIdAndRemove(req.params.id, function (err, tea) {
		if (err) {
			return next(err);
		}
		fs.unlink('public' + tea.picture, function (err) {
			if (err) throw err;
		});
		res.redirect('/catalog/teas');
	});
};

// Display tea update form on GET
exports.teaUpdateGet = function (req, res, next) {
	async.parallel({
		tea: function (callback) {
			Tea.findById(req.params.id)
				.exec(callback);
		},
		categories: function (callback) {
			Category.find()
				.exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.tea == null) {
			const err = new Error('Tea not found');
			err.status = 404;
			return next(err);
		}
		res.render('teaForm', { title: 'Update Tea', tea: results.tea, categories: results.categories, });
	});
};

// Handle tea update on POST
exports.teaUpdatePost = [
	upload.single('picture'),

	// Validate fields
	validator.body('name', 'Tea name required').isLength({ min: 1, }).trim(),
	validator.body('description', 'Tea description required').isLength({ min: 1, }).trim(),
	validator.body('category', 'Tea category required').isLength({ min: 1, }).trim(),
	validator.body('price', 'Tea price must be a positive number').isInt({ min: 1, }).trim(),
	validator.body('quantity', 'Tea quantity must not be a negative number').isInt({ min: 0, }).trim(),

	// Sanitize fields
	validator.sanitizeBody('name').escape(),
	validator.sanitizeBody('description').escape(),
	validator.sanitizeBody('category').escape(),
	validator.sanitizeBody('price').toInt(),
	validator.sanitizeBody('quantity').toInt(),

	// Process request after validation and sanitization
	function (req, res, next) {
		// Extract the validation errors from request
		const errors = validator.validationResult(req);

		const tea = new Tea({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			quantity: req.body.quantity,
			_id: req.params.id,
		});

		if (req.file) {
			tea.picture = req.file.path.slice(6);
		}

		if (!errors.isEmpty()) {
			Category.find()
				.exec(function (err, categories) {
					if (err) {
						return next(err);
					}
					res.render('teaForm', { title: 'Update Tea', tea, categories,});
					return;
				});
		}

		// TODO: Delete old picture from server file system
		Tea.findByIdAndUpdate(req.params.id, tea, {}, function (err, theTea) {
			if (err) {
				return next(err);
			}
			res.redirect(theTea.url);
		});
	},

];

