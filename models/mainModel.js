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

  async addProduct(req) {
    const QUADRANT_ID = req.body.quadrant_id;
    const [QUADRANT_TOTAL_SPACE_RESULT] = await uniq.queryAll(`SELECT total_space FROM quadrants WHERE id = ${QUADRANT_ID}`);
    const QUADRANT_TOTAL_SPACE = QUADRANT_TOTAL_SPACE_RESULT.total_space;
    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    const QUANTITY = req.body.quantity;
    const QUADRANT_FREE_SPACE = QUADRANT_TOTAL_SPACE - QUANTITY;
    const DESCRIPTION = req.body.description.replace(/[\\$'"]/g, "\\$&");
    
    if(QUADRANT_ID && NAME && QUANTITY && DESCRIPTION) {
      uniq.queryNone(`INSERT INTO products(quadrant_id, name, description, quantity, created_at, updated_at) VALUES(${ QUADRANT_ID }, "${ NAME }", "${ DESCRIPTION }", ${ QUANTITY }, NOW(), NOW());`);
      uniq.queryNone(`UPDATE quadrants SET free_space = ${QUADRANT_FREE_SPACE}, updated_at = NOW() WHERE id = ${QUADRANT_ID}`)
      return 0;
    }

    return 1;
  }

  addQuadrant(req) {
    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    const TOTAL_SPACE = req.body.total_space;
    
    if(NAME && TOTAL_SPACE) {
      uniq.queryNone(`INSERT INTO quadrants(name, total_space, free_space, created_at, updated_at) VALUES("${ NAME }", ${ TOTAL_SPACE }, ${ TOTAL_SPACE }, NOW(), NOW());`);
      
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

  removeQuadrant(req) {
    const QUADRANT_ID = req.body.quadrant_id;

    if(QUADRANT_ID) {
      uniq.queryNone(`DELETE FROM products WHERE quadrant_id = ${ QUADRANT_ID };`);
      uniq.queryNone(`DELETE FROM quadrants WHERE id = ${ QUADRANT_ID };`);
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

  async updateQuadrant(req) {
    const QUADRANT_ID = req.body.id;
    const QUADRANT_NAME = req.body.name;
    const QUADRANT_TOTAL_SPACE = req.body.total_space;
    const [QUADRANT_USED_SPACE_RESULT] = await uniq.queryAll(`SELECT COALESCE(SUM(quantity), 0) AS used_space FROM products WHERE quadrant_id = ${QUADRANT_ID}`);
    const QUADRANT_USED_SPACE = QUADRANT_USED_SPACE_RESULT.used_space;
    const QUADRANT_FREE_SPACE = QUADRANT_TOTAL_SPACE - QUADRANT_USED_SPACE;

    if(QUADRANT_ID && QUADRANT_NAME && QUADRANT_TOTAL_SPACE){
      uniq.queryNone(`UPDATE quadrants SET name = "${ QUADRANT_NAME}", total_space = ${QUADRANT_TOTAL_SPACE}, free_space = ${QUADRANT_FREE_SPACE}, updated_at = NOW() WHERE id = ${QUADRANT_ID}`)

      return 0;
    }
    
    return 1;
  }
}

module.exports = new MainModel();