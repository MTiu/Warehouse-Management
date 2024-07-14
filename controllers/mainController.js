const db = require('../models/mainModel');

/**
 * DOCU: The class Users loads the specific view page.
 */

class MainController {

    async login(req, res) {
        res.render('../views/main/login');
    }

    async logout(req, res){
        res.redirect('/');
        req.session.destroy();
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
        const USER = req.session.user;
        const DATA = {
            products: PRODUCTS,
            quadrants: QUADRANTS,
            current_year: CURRENT_YEAR,
            user: USER
        };
        
        res.render('../views/main/view', DATA);
    }

    async logs(req, res){

        if(!req.session.user || req.session.user.level == 2){
            res.redirect('/dashboard');
            return;
        }

        const USER = req.session.user;
        const DATA = {
            user: USER
        };

        res.render('../views/main/log', DATA);
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

    async editLog(req, res){
        try {
            await db.editLog(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async searchUsers(req, res){
        const LOGS = await db.searchUsers(req);
        res.json(LOGS);
    }

    async addUser(req, res){
        try {
            const PASSWORD = await db.addUser(req);
            res.json({status: 0, password: PASSWORD});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async resetUser(req, res){
        try {
            const PASSWORD = await db.resetUser(req);
            res.json({status: 0, password: PASSWORD});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async removeUser(req, res){
        try {
            await db.removeUser(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async editUser(req, res){
        try {
            await db.editUser(req);
            res.json({status: 0});
        } catch(e) {
            res.json({status: 1});
        }
    }

    async users(req, res){

        if(!req.session.user || req.session.user.level == 2){
            res.redirect('/dashboard');
            return;
        }
        
        const USER = req.session.user;
        const DATA = {
            user: USER
        };

        res.render('../views/main/users', DATA);
    }

    async profile(req, res){

        if(!req.session.user){
            res.redirect('/');
            return;
        } 

        const USER = req.session.user;
        const DATA = {
            user: USER
        };

        res.render('../views/main/profile', DATA);
    }

    async changePass(req, res){
        try {
            const DATA = await db.changePass(req,req.session.user);
            res.json({status: 0, message:DATA});
        } catch(e) {
            res.json({status: 1});
        }
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

