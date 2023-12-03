const db = require('../models/mainModel');

/**
 * DOCU: The class Users loads the specific view page.
 */

class MainController {
    async dashboard(req, res) { 
        const PRODUCTS = await db.getProducts();
        const QUADRANTS = await db.getQuadrants();
        const DATA = {
            products: PRODUCTS,
            quadrants: QUADRANTS 
        };

        res.render('../views/main/dashboard', DATA);
    }

    async getQuadrantProducts(req, res) {
        const PRODUCTS = await db.getQuadrantProducts(req);
        const DATA = { products: PRODUCTS };
        
        res.json(DATA);
    }

    async addProduct(req, res) {
        try {
            db.addProduct(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async removeProduct(req, res) {
        try {
            db.removeProduct(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async updateProduct(req, res) {
        try {
            db.updateProduct(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }
}

/**
 * DOCU: Export Survey object to routes.
 */

module.exports = new MainController();

