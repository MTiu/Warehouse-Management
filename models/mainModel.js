const uniq = require('../static/lib/universal-query/universalQuery');

class MainModel {
  getProducts() {
    return uniq.queryAll("SELECT * FROM products");
  }

  getQuadrants() {
    return uniq.queryAll("SELECT * FROM quadrants");
  }

  getQuadrantProducts(req) {
    const QUADRANT_LIST = req.body.quadrant_list; // SAMPLE RETURN: 1,2,3 || 0
    const QUERY_STRING = (req.body.query_string) ? req.body.query_string : ""; // SAMPLE RETURN: 1,2,3 || 0
    return uniq.queryAll(`SELECT products.*, q.name AS quadrant_name FROM products LEFT JOIN quadrants as q ON products.quadrant_id = q.id WHERE products.quadrant_id IN(${ QUADRANT_LIST }) AND products.name LIKE "%${ QUERY_STRING }%" ORDER BY products.quadrant_id;`);
  }

  addProduct(req) {
    const QUADRANT_ID = req.body.quadrant_id;
    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    const QUANTITY = req.body.quantity;
    const DESCRIPTION = req.body.description.replace(/[\\$'"]/g, "\\$&");

    if(QUADRANT_ID && NAME && QUANTITY && DESCRIPTION) {
      uniq.queryNone(`INSERT INTO products(quadrant_id, name, description, quantity, created_at, updated_at) VALUES(${ QUADRANT_ID }, "${ NAME }", "${ DESCRIPTION }", ${ QUANTITY }, NOW(), NOW());`);
      
      return 0;
    }

    return 1;
  }

  removeProduct(req) {
    const PRODUCT_ID = req.body.product_id;

    if(PRODUCT_ID) {
      uniq.queryNone(`DELETE FROM products WHERE id = ${ PRODUCT_ID };`);

      return 0;
    }

    return 1;
  }

  updateProduct(req) {
    const PRODUCT_ID = req.body.product_id;
    const QUADRANT_ID = req.body.quadrant_id;
    const PRODUCT_NAME = req.body.product_name;
    const PRODUCT_QUANTITY = req.body.product_quantity;
    const PRODUCT_DESCRIPTION = req.body.product_description;

    if(PRODUCT_ID && QUADRANT_ID && PRODUCT_NAME && PRODUCT_QUANTITY && PRODUCT_DESCRIPTION) {
      uniq.queryNone(`UPDATE products SET quadrant_id = "${ QUADRANT_ID }", name = "${ PRODUCT_NAME }", quantity = "${ PRODUCT_QUANTITY }", description = "${ PRODUCT_DESCRIPTION }" WHERE id = "${ PRODUCT_ID }";`);

      return 0;
    }

    return 1;
  }
}

module.exports = new MainModel();