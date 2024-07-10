const db = require('../models/mainModel');

/**
 * DOCU: The class Users loads the specific view page.
 */

class MainController {

    async login(req, res) {
        res.render('../views/main/login');
    }

    async logProc(req, res) {
        const USER = await db.getUser(req);
        if(typeof USER == "string"){
            res.json({message: USER});
            return;
        }

        req.session.user = USER;
        res.json('/dashboard');
    }

    async dashboard(req, res) { 

        if(!req.session.user){
            res.redirect('/');
            return;
        } 

        const PRODUCTS = await db.getProducts();
        const QUADRANTS = await db.getQuadrants();
        const TOPPRODUCTS = await db.getTopProducts();
        const USER = req.session.user;
        const DATA = {
            products: PRODUCTS,
            quadrants: QUADRANTS,
            top_products: TOPPRODUCTS,
            user: USER
        };

        res.render('../views/main/dashboard', DATA);
    }

    async view(req, res) { 

        if(!req.session.user){
            res.redirect('/');
            return;
        }

        const PRODUCTS = await db.getProducts();
        const QUADRANTS = await db.getQuadrants();
        const CURRENT_YEAR = new Date().getFullYear();
        const DATA = {
            products: PRODUCTS,
            quadrants: QUADRANTS,
            current_year: CURRENT_YEAR
        };
        
        res.render('../views/main/view', DATA);
    }

    async logs(req, res){

        if(!req.session.user){
            res.redirect('/');
            return;
        }

        res.render('../views/main/log');
    }

    async searchLogs(req, res){
        const LOGS = await db.searchLogs(req);
        res.json(LOGS);
    }

    async removeLog(req, res){
        try {
            await db.removeLog(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async users(req, res){
        res.render('../views/main/users');
    }

    async profile(req, res){
        res.render('../views/main/profile');
    }

    async getQuadrantProducts(req, res) {
        const PRODUCTS = await db.getQuadrantProducts(req);
        const DATA = { products: PRODUCTS };

        res.json(DATA);
    }

    async getTopProducts(req, res){
        const TOPPRODUCTS = await db.getTopProducts();
        const DATA = { top_products: TOPPRODUCTS};

        res.json(DATA);
    }

    async getDoughChart(req, res){
        const SPACE = await db.getDoughChart();
        const DATA = { warehouse_space: SPACE};

        res.json(DATA);
    }

    async getLineChart(req, res){
        const LOGS = await db.getLineChart(req);
        const DATA = { logs: LOGS};

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
            const ERRORS = await db.addProduct(req);
            const DATA = {
                errors: ERRORS
            }
            res.json(DATA);
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
            await db.removeProduct(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async removeQuadrant(req, res) {
        try {
            await db.removeQuadrant(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async updateProduct(req, res) {
        try {
            const ERRORS = await db.updateProduct(req);
            const DATA = {
                errors: ERRORS
            }
            res.json(DATA);
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

