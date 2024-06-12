/**
 * DOCU: Loads the Express Module in order for us
 * to use the Router Function.
 */

const express = require("express");

/**
 * DOCU: Using Express Module rename Router function
 * to Router.
 */

const mainRoutes = express.Router();

/**
 * DOCU: Imports Controller Module
 * NOTE: Controller Exports Ready Made Object
 * No need to create new object.
 */

const mainController = require("../controllers/mainController");

/**
 * DOCU: Using the Object from module controller
 * Routes the User from specific request.
 */

mainRoutes.get("/", mainController.dashboard);
mainRoutes.get("/dashboard", mainController.dashboard);
mainRoutes.get("/view", mainController.view);
mainRoutes.post("/dashboard", mainController.getQuadrantProducts);
mainRoutes.post("/product/add", mainController.addProduct);
mainRoutes.post("/product/remove", mainController.removeProduct);
mainRoutes.post("/product/update", mainController.updateProduct);
mainRoutes.post("/quadrant/add", mainController.addQuadrant);
mainRoutes.post("/products/top", mainController.getTopProducts)
mainRoutes.post("/quadrant", mainController.getQuadrants);
mainRoutes.post("/quadrant/remove", mainController.removeQuadrant);
mainRoutes.post("/quadrant/update", mainController.updateQuadrant);
mainRoutes.post("/chart/doughnut", mainController.getDoughChart);
mainRoutes.post("/chart/line", mainController.getLineChart);
/**
 * DOCU: Export Router Module to App.js
 */

module.exports = mainRoutes; 