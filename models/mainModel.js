const uniq = require('../static/lib/universal-query/universalQuery');

class MainModel {
  getProducts() {
    return uniq.queryAll("SELECT * FROM products");
  }

  getQuadrants() {
    return uniq.queryAll("SELECT * FROM quadrants");
  }

  getTopProducts() {
    return uniq.queryAll(`
        SELECT p.id, p.name, COUNT(l.product_id) as move_count
        FROM logs l
        JOIN products p ON l.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY move_count DESC
        LIMIT 5;
      `)
  }

  getDoughChart() {
    return uniq.queryAll(`
    SELECT 
        SUM(free_space) AS free_space,
        SUM(total_space) - SUM(free_space) AS used_space
    FROM quadrants;
      `)
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

  async removeProduct(req) {
    const PRODUCT_ID = req.body.product_id;
    const PRODUCT_QUANTITY = parseInt(req.body.product_quantity);
    const QUADRANT_ID = req.body.quadrant_id;
    const [QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE ID = ${QUADRANT_ID}`)
    const QUADRANT_FREE_SPACE = QUADRANT_FREE_SPACE_RESULT.free_space + PRODUCT_QUANTITY;
    if(PRODUCT_ID && QUADRANT_ID) {
      uniq.queryNone(`DELETE FROM products WHERE id = ${ PRODUCT_ID };`);
      uniq.queryNone(`UPDATE quadrants SET free_space = ${QUADRANT_FREE_SPACE} WHERE id = ${QUADRANT_ID};`);
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

  async updateProduct(req) {
    const PRODUCT_ID = req.body.product_id;
    const QUADRANT_ID = req.body.quadrant_id;
    const PRODUCT_NAME = req.body.product_name;
    const PRODUCT_QUANTITY = parseInt(req.body.product_quantity);
    const PRODUCT_DESCRIPTION = req.body.product_description;
    let operation = "";

    if(PRODUCT_ID && QUADRANT_ID && PRODUCT_NAME && PRODUCT_QUANTITY && PRODUCT_DESCRIPTION) {
      const [PRODUCT_CURRENT_RESULT] = await uniq.queryAll(`SELECT quantity, quadrant_id FROM products WHERE id = ${PRODUCT_ID}`);
      const PRODUCT_CURRENT_QUANTITY = PRODUCT_CURRENT_RESULT.quantity;
      const PRODUCT_CURRENT_QUADRANT_ID = PRODUCT_CURRENT_RESULT.quadrant_id;
  
      // Update the product
      await uniq.queryNone(`UPDATE products SET quadrant_id = "${ QUADRANT_ID }", name = "${ PRODUCT_NAME }", quantity = "${ PRODUCT_QUANTITY }", description = "${ PRODUCT_DESCRIPTION }" WHERE id = "${ PRODUCT_ID }";`);
  
      if (PRODUCT_QUANTITY !== PRODUCT_CURRENT_QUANTITY) {
        // Calculate the difference in quantity
        const quantityDifference = PRODUCT_QUANTITY - PRODUCT_CURRENT_QUANTITY;
        let operation = '';
        if (quantityDifference > 0) {
          operation = 'Add';
        } else if (quantityDifference < 0) {
          operation = 'Subtract';
        }
        // Log the update operation
        await uniq.queryNone(`INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES (${PRODUCT_ID}, '${operation}', ${Math.abs(quantityDifference)}, NOW(), NOW())`);
      }
      // Update the free space in the previous quadrant
      if (PRODUCT_CURRENT_QUADRANT_ID !== QUADRANT_ID) {
        const [PREV_QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE id = ${PRODUCT_CURRENT_QUADRANT_ID}`);
        const PREV_QUADRANT_FREE_SPACE = PREV_QUADRANT_FREE_SPACE_RESULT.free_space + PRODUCT_CURRENT_QUANTITY;
        await uniq.queryNone(`UPDATE quadrants SET free_space = ${PREV_QUADRANT_FREE_SPACE} WHERE id = ${PRODUCT_CURRENT_QUADRANT_ID}`);
      }
      // Update the free space in the new quadrant
      const [NEW_QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE id = ${QUADRANT_ID}`);
      const NEW_QUADRANT_FREE_SPACE = NEW_QUADRANT_FREE_SPACE_RESULT.free_space - PRODUCT_QUANTITY;
      await uniq.queryNone(`UPDATE quadrants SET free_space = ${NEW_QUADRANT_FREE_SPACE} WHERE id = ${QUADRANT_ID}`);

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