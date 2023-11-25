const db = require('../models/productModel');
db.trainModel();

/**
 * DOCU: The class Users loads the specific view page.
 */

class ProductController {
    async product(req, res) {
        let user = {
            gender: undefined,
            age: undefined
        };

        if(req.session.user) {
            user = req.session.user[0];
        }

        const product = (await db.getProduct(req.params.product_id))[0];
    
        res.render('../views/product/product', {product: product, user: user});
    }

    async shop(req, res) {        
        let user = {
            gender: undefined,
            age: undefined
        };

        if(req.session.user) {
            user = req.session.user[0];
        }

        res.render('../views/shop/shop', { user: user });
    }

    async search(req, res) {
        let user = {
            gender: undefined,
            age: undefined
        };

        if(req.session.user) {
            user = req.session.user[0];
        }
        
        let data = {}

        if(req.body.data.sort_key) {
            data = {
                data: {
                    string: req.body.data.string,
                    sort_key: req.body.data.sort_key
                }
            }
        } else {
            data = {
                data: {
                    string: "",
                    sort_key: "p.id"
                }
            }
        }

        let products;

        if(data.data.sort_key == "featured") {
            products = await db.getSortedProducts(user, data);
        } else {
            products = await db.getProducts(data);
        }
        
        res.json(products);
    }

    async createCategory(req, res) {
        await db.createCategory(req.body.category);

        res.redirect('/admin/product/' + req.body.product_id);
    }

    // @TODO ADD DESCRIPTION LATER
    async createProduct(req, res) {
        await db.createProduct(req);
        
        res.redirect('/admin/products');
    }
    
    // @TODO ADD DESCRIPTION LATER
    async createProductCategories(req, res) {
        await db.createProductCategories(req);

        res.redirect('/admin/product/' + req.body.product_id);
    }    
    
    // @TODO ADD DESCRIPTION LATER
    async adminProducts(req, res) {
        const DATA = {
            data: {
              string: "",
              sort_key: "relevance"
            }
        };

        const products = await db.getProducts(DATA);
        
        res.render('../views/user/adminProducts', {products: products});
    }

    // @TODO ADD DESCRIPTION LATER
    async adminProduct(req, res) {
        const product = (await db.getProduct(req.params.product_id))[0];
        const categories = await db.getCategories();

        res.render('../views/user/adminProduct', {product: product, categories: categories});
    }

    // @TODO ADD DESCRIPTION LATER
    async getSortedProducts(req, res) {
        let user = {
            gender: undefined,
            age: undefined
        };

        if(req.session.user) {
            user = req.session.user[0];
        }

        const DATA = {
            data: {
              string: "",
              sort_key: "relevance"
            }
        };

        const products = await db.getSortedProducts(user, DATA);

        res.json(products);
    }
}

/**
 * DOCU: Export Survey object to routes.
 */

module.exports = new ProductController();

