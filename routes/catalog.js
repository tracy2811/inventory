const express = require('express');
const route = express.Router();

const teaController = require('../controllers/teaController');
const categoryController = require('../controllers/categoryController');

/// TEA ROUTES ///
// GET catalog home page
route.get('/', teaController.index);

// GET request for tea list
route.get('/teas/', teaController.teaList);

// GET request for create tea form
route.get('/tea/create', teaController.teaCreateGet);

// POST request to create tea
route.post('/tea/create', teaController.teaCreatePost);

// GET request for tea details
route.get('/tea/:id', teaController.teaDetail);

// GET request for delete tea form
route.get('/tea/:id/delete', teaController.teaDeleteGet);

// POST request to delete tea
route.post('/tea/:id/delete', teaController.teaDeletePost);

// GET request for update tea form
route.get('/tea/:id/update', teaController.teaUpdateGet);

// POST request to update tea
route.post('/tea/:id/update', teaController.teaUpdatePost);

/// CATEGORY ROUTES ///
// GET request for category list
route.get('/categories', categoryController.categoryList);

// GET request for create category form
route.get('/category/create', categoryController.categoryCreateGet);

// POST request to create category
route.post('/category/create', categoryController.categoryCreatePost);

// GET request for category details
route.get('/category/:id', categoryController.categoryDetail);

// GET request for delete category form
route.get('/category/:id/delete', categoryController.categoryDeleteGet);

// POST request to delete category form
route.post('/category/:id/delete', categoryController.categoryDeletePost);

// GET request for updaet category form
route.get('/category/:id/update', categoryController.categoryUpdateGet);

// POST request to udpate category
route.post('/category/:id/update', categoryController.categoryUpdatePost);

module.exports = route;
