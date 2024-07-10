const uniq = require('../static/lib/universal-query/universalQuery');

function formatDateForDB(date) {
  const dateObject = new Date(date);
  return dateObject.toISOString().slice(0, 19).replace('T', ' ');
}

class MainModel {
  getProducts() {
    return uniq.queryAll("SELECT * FROM products");
  }

  getQuadrants() {
    return uniq.queryAll("SELECT * FROM quadrants");
  }

  async getUser(req) {
    const USERNAME = req.body.username.replace(/[\\$'"]/g, "\\$&");
    const PASSWORD = req.body.password.replace(/[\\$'"]/g, "\\$&");
    const [USER] = await uniq.queryAll(`SELECT * FROM users WHERE BINARY username = "${USERNAME}" `);
    if(!USER){
      return "Username is Incorrect!";
    } else {
      if(PASSWORD === USER.password){
        return USER;
      } else {
        return "Password is Incorrect!";
      }
    }
  }

  async searchLogs(req){
    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    return uniq.queryAll(`
      SELECT 
          l.id,
          COALESCE(p.id, 0) AS product_id,
          l.product_name AS product_name,
          l.username,
          l.operation,
          l.quantity,
          l.created_at,
          l.updated_at
      FROM 
          logs l
      LEFT JOIN 
          products p ON l.product_id = p.id
      LEFT JOIN 
          users u ON l.user_id = u.id
      WHERE '${NAME}' = '' OR l.product_name LIKE '%${NAME}%'
      ORDER BY 
          l.created_at DESC;
      `);
  }

  async removeLog(req){
    const LOG_ID = req.body.ID;

    if(LOG_ID){
      uniq.queryNone(`DELETE FROM logs WHERE ID = ${LOG_ID}`);
    }
    return;
  }

  getTopProducts() {
    return uniq.queryAll(`
        SELECT p.id, p.name, SUM(l.quantity) as move_count
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

  getLineChart(req) {
    return uniq.queryAll(`
      WITH months AS (
          SELECT 1 AS month UNION
          SELECT 2 UNION
          SELECT 3 UNION
          SELECT 4 UNION
          SELECT 5 UNION
          SELECT 6 UNION
          SELECT 7 UNION
          SELECT 8 UNION
          SELECT 9 UNION
          SELECT 10 UNION
          SELECT 11 UNION
          SELECT 12
      )
      SELECT 
          m.month,
          COALESCE(SUM(CASE WHEN l.operation = 'Add' THEN l.quantity ELSE 0 END), 0) AS total_adds,
          COALESCE(SUM(CASE WHEN l.operation = 'Subtract' THEN l.quantity ELSE 0 END), 0) AS total_subtracts
      FROM 
          months m
      LEFT JOIN 
          logs l ON m.month = MONTH(l.created_at) AND YEAR(l.created_at) = ${req.body.selectedYear}
      GROUP BY 
          m.month
      ORDER BY 
          m.month;
      
      `);
  }

  getQuadrantProducts(req) {
    const QUADRANT_LIST = req.body.quadrant_list; // SAMPLE RETURN: 1,2,3 || 0
    const QUERY_STRING = (req.body.query_string) ? req.body.query_string : ""; // SAMPLE RETURN: 1,2,3 || 0
    return uniq.queryAll(`SELECT products.*, q.name AS quadrant_name FROM products LEFT JOIN quadrants as q ON products.quadrant_id = q.id WHERE products.quadrant_id IN(${ QUADRANT_LIST }) AND products.name LIKE "%${ QUERY_STRING }%" ORDER BY products.quadrant_id;`);
  }

  async addProduct(req) {
    const USER = req.body.user;
    const QUADRANT_ID = req.body.quadrant_id;
    const [QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE id = ${QUADRANT_ID}`);
    const QUADRANT_FREE_SPACE = QUADRANT_FREE_SPACE_RESULT.free_space;

    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    const QUANTITY = parseInt(req.body.quantity, 10);
    const DESCRIPTION = req.body.description.replace(/[\\$'"]/g, "\\$&");

    const LENGTH = parseFloat(req.body.length);
    const WIDTH = parseFloat(req.body.width);
    const HEIGHT = parseFloat(req.body.height);
    const PRODUCT_VOLUME = Math.round(LENGTH * WIDTH * HEIGHT);
    const TOTAL_OCCUPIED_SPACE = PRODUCT_VOLUME * QUANTITY;
    const NEW_FREE_SPACE = QUADRANT_FREE_SPACE - TOTAL_OCCUPIED_SPACE;

    if (QUADRANT_ID && NAME && QUANTITY && DESCRIPTION) {
        if (NEW_FREE_SPACE < 0) {
            return true;
        }
        await uniq.queryNone(`INSERT INTO products (quadrant_id, name, description, quantity, length, width, height, created_at, updated_at) VALUES (${QUADRANT_ID}, "${NAME}", "${DESCRIPTION}", ${QUANTITY}, ${LENGTH}, ${WIDTH}, ${HEIGHT}, NOW(), NOW())`);
        await uniq.queryNone(`UPDATE quadrants SET free_space = ${NEW_FREE_SPACE}, updated_at = NOW() WHERE id = ${QUADRANT_ID}`);
        const [PRODUCT] = await uniq.queryAll(`SELECT id FROM products ORDER BY id DESC LIMIT 1; `);
        const [USERNAME] = await uniq.queryAll(`SELECT username FROM users WHERE id = "${USER}"`);
        await uniq.queryNone(`
          INSERT INTO logs (user_id, username, product_id, product_name, operation, quantity, created_at, updated_at) 
          VALUES (${USER}, "${USERNAME.username}" , ${PRODUCT.id}, "${NAME}", 'New', ${QUANTITY}, NOW(), NOW())
        `);
        return 0;
    }
    return 1;
}

  addQuadrant(req) {
    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    const length = req.body.total_length;
    const height = req.body.total_height;
    const width = req.body.total_width;
    const TOTAL_SPACE = Math.round(length * height * width);

    if(NAME && TOTAL_SPACE) {
      uniq.queryNone(`INSERT INTO quadrants(name, total_space, free_space, length, width, height, created_at, updated_at) VALUES("${ NAME }", ${ TOTAL_SPACE }, ${ TOTAL_SPACE }, ${ length }, ${ width }, ${ height }, NOW(), NOW());`);
      
      return 0;
    }

    return 1;
  }

  async removeProduct(req) {
    const USER = req.body.user;
    const PRODUCT_ID = req.body.product_id;
    const PRODUCT_NAME = req.body.product_name;
    const NEW_PRODUCT_QUANTITY = parseInt(req.body.product_quantity);
    const NEW_QUADRANT_ID = req.body.quadrant_id;
    const NEW_PRODUCT_LENGTH = parseFloat(req.body.length);
    const NEW_PRODUCT_WIDTH = parseFloat(req.body.width);
    const NEW_PRODUCT_HEIGHT = parseFloat(req.body.height);
    const NEW_PRODUCT_VOLUME = Math.round(NEW_PRODUCT_LENGTH * NEW_PRODUCT_WIDTH * NEW_PRODUCT_HEIGHT);

    const [QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE ID = ${NEW_QUADRANT_ID}`)
    const QUADRANT_FREE_SPACE = parseFloat(QUADRANT_FREE_SPACE_RESULT.free_space);

    const NEW_QUADRANT_FREE_SPACE = QUADRANT_FREE_SPACE + (NEW_PRODUCT_VOLUME * NEW_PRODUCT_QUANTITY);
    if(PRODUCT_ID && NEW_QUADRANT_ID) {
      uniq.queryNone(`DELETE FROM products WHERE id = ${ PRODUCT_ID };`);
      uniq.queryNone(`UPDATE quadrants SET free_space = ${NEW_QUADRANT_FREE_SPACE.toFixed(2)} WHERE id = ${NEW_QUADRANT_ID}`);
      const [USERNAME] = await uniq.queryAll(`SELECT username FROM users WHERE id = "${USER}"`);
      uniq.queryNone(`
        INSERT INTO logs (user_id, username, product_id, product_name, operation, quantity, created_at, updated_at) 
        VALUES (${USER}, "${USERNAME.username}" , ${PRODUCT_ID}, "${PRODUCT_NAME}", 'Remove', ${NEW_PRODUCT_QUANTITY}, NOW(), NOW())
      `);
      return 0;

    }

    return 1;
  }

  async removeQuadrant(req) {
    const QUADRANT_ID = req.body.quadrant_id;

    if(QUADRANT_ID) {
      uniq.queryNone(`DELETE FROM products WHERE quadrant_id = ${ QUADRANT_ID };`);
      uniq.queryNone(`DELETE FROM quadrants WHERE id = ${ QUADRANT_ID };`);
      return 0;
    }

    return 1;
  }

  async updateProduct(req) {
    const USER = req.body.user;
    const PRODUCT_ID = req.body.product_id;
    const NEW_QUADRANT_ID = parseInt(req.body.quadrant_id);
    const NEW_PRODUCT_NAME = req.body.product_name;
    const NEW_PRODUCT_QUANTITY = parseInt(req.body.product_quantity);
    const PRODUCT_DESCRIPTION = req.body.product_description;
    const NEW_PRODUCT_LENGTH = parseFloat(req.body.length);
    const NEW_PRODUCT_WIDTH = parseFloat(req.body.width);
    const NEW_PRODUCT_HEIGHT = parseFloat(req.body.height);
    const NEW_PRODUCT_VOLUME = Math.round(NEW_PRODUCT_LENGTH * NEW_PRODUCT_WIDTH * NEW_PRODUCT_HEIGHT);
  
    if (!(PRODUCT_ID && NEW_QUADRANT_ID && NEW_PRODUCT_NAME && !isNaN(NEW_PRODUCT_QUANTITY) && PRODUCT_DESCRIPTION)) {
      return 1; // Missing required fields
    }
  
    // Fetch current product details
    const [PRODUCT_CURRENT_RESULT] = await uniq.queryAll(`SELECT length, width, height, quantity, quadrant_id FROM products WHERE id = ${PRODUCT_ID}`);
  
    const PRODUCT_CURRENT_QUANTITY = parseInt(PRODUCT_CURRENT_RESULT.quantity);
    const PRODUCT_CURRENT_QUADRANT_ID = parseInt(PRODUCT_CURRENT_RESULT.quadrant_id);
    const PRODUCT_CURRENT_LENGTH = parseFloat(PRODUCT_CURRENT_RESULT.length);
    const PRODUCT_CURRENT_WIDTH = parseFloat(PRODUCT_CURRENT_RESULT.width);
    const PRODUCT_CURRENT_HEIGHT = parseFloat(PRODUCT_CURRENT_RESULT.height);
    const PRODUCT_CURRENT_VOLUME = Math.round(PRODUCT_CURRENT_LENGTH * PRODUCT_CURRENT_WIDTH * PRODUCT_CURRENT_HEIGHT);
  
    const quantityDifference = NEW_PRODUCT_QUANTITY - PRODUCT_CURRENT_QUANTITY;
  
    // Calculate total occupied space change
    let TOTAL_OCCUPIED_SPACE = NEW_PRODUCT_VOLUME * NEW_PRODUCT_QUANTITY;
  
    if (PRODUCT_CURRENT_QUADRANT_ID === NEW_QUADRANT_ID) {
      // No change in quadrant, adjust occupied space based on quantity difference
      TOTAL_OCCUPIED_SPACE -= PRODUCT_CURRENT_VOLUME * PRODUCT_CURRENT_QUANTITY;
    }
  
    // Fetch current and new quadrant free space
    const [NEW_QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE id = ${NEW_QUADRANT_ID}`);
    const NEW_QUADRANT_FREE_SPACE = parseFloat(NEW_QUADRANT_FREE_SPACE_RESULT.free_space);
  
    if (NEW_QUADRANT_FREE_SPACE - TOTAL_OCCUPIED_SPACE < 0) {
      return true; // Not enough free space in new quadrant
    }
  
    // Update the product
    await uniq.queryNone(`
      UPDATE products SET 
      quadrant_id = "${NEW_QUADRANT_ID}", 
      name = "${NEW_PRODUCT_NAME}", 
      quantity = ${NEW_PRODUCT_QUANTITY}, 
      description = "${PRODUCT_DESCRIPTION}", 
      length = ${NEW_PRODUCT_LENGTH}, 
      width = ${NEW_PRODUCT_WIDTH}, 
      height = ${NEW_PRODUCT_HEIGHT} 
      WHERE id = ${PRODUCT_ID}
    `);
  
    // Log quantity change if applicable
    if (quantityDifference !== 0) {
      const operation = quantityDifference > 0 ? 'Add' : 'Subtract';
      const [USERNAME] = await uniq.queryAll(`SELECT username FROM users WHERE id = "${USER}"`);
      await uniq.queryNone(`
        INSERT INTO logs (user_id, username, product_id, product_name, operation, quantity, created_at, updated_at) 
        VALUES (${USER}, "${USERNAME.username}" , ${PRODUCT_ID}, "${NEW_PRODUCT_NAME}", '${operation}', ${Math.abs(quantityDifference)}, NOW(), NOW())
      `);
    }
  
    // Update free space in previous quadrant if changed
    if (PRODUCT_CURRENT_QUADRANT_ID !== NEW_QUADRANT_ID) {
      const [PREV_QUADRANT_FREE_SPACE_RESULT] = await uniq.queryAll(`SELECT free_space FROM quadrants WHERE id = ${PRODUCT_CURRENT_QUADRANT_ID}`);
      const PREV_QUADRANT_FREE_SPACE = parseFloat(PREV_QUADRANT_FREE_SPACE_RESULT.free_space) + (PRODUCT_CURRENT_VOLUME * PRODUCT_CURRENT_QUANTITY);  
      await uniq.queryNone(`UPDATE quadrants SET free_space = ${PREV_QUADRANT_FREE_SPACE} WHERE id = ${PRODUCT_CURRENT_QUADRANT_ID}`);
    }
  
    // Update free space in new quadrant
    const UPDATED_NEW_QUADRANT_FREE_SPACE = NEW_QUADRANT_FREE_SPACE - TOTAL_OCCUPIED_SPACE;
    await uniq.queryNone(`UPDATE quadrants SET free_space = ${UPDATED_NEW_QUADRANT_FREE_SPACE} WHERE id = ${NEW_QUADRANT_ID}`);
  
    return 0; // Success
  }
  
  async updateQuadrant(req) {
    const QUADRANT_ID = req.body.id;
    const QUADRANT_NAME = req.body.name;
    const QUADRANT_LENGTH = parseFloat(req.body.length);
    const QUADRANT_WIDTH = parseFloat(req.body.width);
    const QUADRANT_HEIGHT = parseFloat(req.body.height);
    const QUADRANT_TOTAL_SPACE = Math.round(QUADRANT_LENGTH * QUADRANT_WIDTH * QUADRANT_HEIGHT);  
    const [QUADRANT_USED_SPACE_RESULT] = await uniq.queryAll(`SELECT COALESCE(SUM(quantity * length * width * height), 0) AS used_space FROM products WHERE quadrant_id = ${QUADRANT_ID}`);
    const QUADRANT_USED_SPACE = parseFloat(QUADRANT_USED_SPACE_RESULT.used_space);
    const QUADRANT_FREE_SPACE = QUADRANT_TOTAL_SPACE - QUADRANT_USED_SPACE;

    if(QUADRANT_ID && QUADRANT_NAME && QUADRANT_TOTAL_SPACE){
      uniq.queryNone(`UPDATE quadrants SET name = "${QUADRANT_NAME}", total_space = ${QUADRANT_TOTAL_SPACE}, free_space = ${QUADRANT_FREE_SPACE}, length = ${QUADRANT_LENGTH}, width = ${QUADRANT_WIDTH}, height = ${QUADRANT_HEIGHT}, updated_at = NOW() WHERE id = ${QUADRANT_ID}`);

      return 0;
    }
    
    return 1;
  }
}

module.exports = new MainModel();