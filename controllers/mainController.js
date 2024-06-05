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
    
    async view(req, res) { 
        const PRODUCTS = await db.getProducts();
        const QUADRANTS = await db.getQuadrants();
        const DATA = {
            products: PRODUCTS,
            quadrants: QUADRANTS 
        };

        res.render('../views/main/view', DATA);
    }

    async getQuadrantProducts(req, res) {
        const PRODUCTS = await db.getQuadrantProducts(req);
        const QUADRANTS = await db.getQuadrants();
        const DATA = {
            products: PRODUCTS,
            quadrants: QUADRANTS 
        };
        
        res.json(DATA);
    }

    async getQuadrants(req, res) {
        const QUADRANTS = await db.getQuadrants();
        const DATA = {
            quadrants: QUADRANTS 
        };
        
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

    async addQuadrant(req, res) {
        try {
            db.addQuadrant(req);
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

    async removeQuadrant(req, res) {
        try {
            db.removeQuadrant(req);
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

    async updateQuadrant(req, res) {
        try {
            db.updateQuadrant(req);
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

