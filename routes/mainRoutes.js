/**
 * DOCU: Loads the Express Module in order for us
 * to use the Router Function.
 */

const express = require("express");

/**
 * DOCU: Using Express Module rename Router function
 * to Router.
 */

const productRoutes = express.Router();

/**
 * DOCU: Imports Controller Module
 * NOTE: Controller Exports Ready Made Object
 * No need to create new object.
 */

const productController = require("../controllers/productController");

/**
 * DOCU: Using the Object from module controller
 * Routes the User from specific request.
 */

productRoutes.get("/product/:product_id", productController.product);
productRoutes.get("/shop", productController.shop);
productRoutes.post("/search", productController.search);
productRoutes.get("/products/getSortedProducts", productController.getSortedProducts);
productRoutes.post("/create/category", productController.createCategory);
productRoutes.post("/create/product", productController.createProduct);
productRoutes.post("/create/product-categories", productController.createProductCategories);
productRoutes.get("/admin/products", productController.adminProducts);
productRoutes.get("/admin/product/:product_id", productController.adminProduct);

/**
 * DOCU: Export Router Module to App.js
 */

module.exports = productRoutes; 
