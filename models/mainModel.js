const uniq = require('../static/lib/universal-query/universalQuery');

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

  async editLog(req){
    const LOG_ID = req.body.log_id;
    const PRODUCT_NAME = req.body.product_name;
    const QUANTITY = req.body.quantity;
    const OPERATION = req.body.operation;
    if(LOG_ID && PRODUCT_NAME && QUANTITY && OPERATION){
      uniq.queryNone(`UPDATE logs SET product_name = "${PRODUCT_NAME}", quantity = ${QUANTITY}, operation = "${OPERATION}", updated_at = NOW() WHERE id = ${LOG_ID};`);
    }
    return;
  }

  async searchUsers(req){
    const NAME = req.body.name.replace(/[\\$'"]/g, "\\$&");
    return uniq.queryAll(`SELECT * FROM users WHERE '${NAME}' = '' OR username LIKE '%${NAME}%' ORDER BY id;`);
  }

  async addUser(req){
    const FIRST_NAME = req.body.first_name.replace(/[\\$'"]/g, "\\$&");
    const LAST_NAME = req.body.last_name.replace(/[\\$'"]/g, "\\$&");
    const USERNAME = req.body.username.replace(/[\\$'"]/g, "\\$&");
    const PASSWORD = Math.floor(Math.random() * 9000) + 1000;
    const LEVEL = req.body.level;

    if(FIRST_NAME && LAST_NAME && USERNAME && LEVEL){
      uniq.queryNone(`INSERT INTO users (first_name, last_name, level, username, password, created_at, updated_at)
                      VALUES ("${FIRST_NAME}", "${LAST_NAME}", ${LEVEL}, "${USERNAME}", "${PASSWORD}", NOW(), NOW());
        `)
    }
    return PASSWORD;
  }

  async resetUser(req){
    const USER_ID = req.body.ID;
    const PASSWORD = Math.floor(Math.random() * 9000) + 1000;
    if(USER_ID){
      uniq.queryNone(`UPDATE users SET password = ${PASSWORD} WHERE id = ${USER_ID}`);
    }
    return PASSWORD;
  }

  async removeUser(req){
    const USER_ID = req.body.ID;

    if(USER_ID){
      uniq.queryNone(`DELETE FROM users WHERE ID = ${USER_ID}`);
    }
    return;
  }

  async editUser(req){
    const USER_ID = req.body.user_id
    const FIRST_NAME = req.body.first_name.replace(/[\\$'"]/g, "\\$&");
    const LAST_NAME = req.body.last_name.replace(/[\\$'"]/g, "\\$&");
    const USERNAME = req.body.username.replace(/[\\$'"]/g, "\\$&");
    let LEVEL = req.body.level;
    if(USER_ID == 1){
      LEVEL = 1;
    } 

    if(USER_ID, FIRST_NAME, LAST_NAME, USERNAME, LEVEL){
      uniq.queryNone(`UPDATE users SET first_name = "${FIRST_NAME}", last_name = "${LAST_NAME}", username = "${USERNAME}", level = ${LEVEL} WHERE id = ${USER_ID};`);
    }
    return;
  }

  async changePass(req,user){
    const NEW_PASSWORD = req.body.new_password.replace(/[\\$'"]/g, "\\$&");
    const OLD_PASSWORD = req.body.old_password.replace(/[\\$'"]/g, "\\$&");
    const CURRENT_PASSWORD = user.password.replace(/[\\$'"]/g, "\\$&");
    if(OLD_PASSWORD === CURRENT_PASSWORD){
      await uniq.queryNone(`UPDATE users SET password = "${NEW_PASSWORD}" WHERE id = ${user.id};`);
      return "Change password is successful";
    } else {
      return "Old Password is wrong!";
    }
    
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

  async addProduct(req,user) {
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
    if (QUADRANT_ID && NAME && QUANTITY) {
        if (NEW_FREE_SPACE < 0) {
            return true;
        }
        uniq.queryNone(`INSERT INTO products (quadrant_id, name, description, quantity, length, width, height, created_at, updated_at) 
                        VALUES (${QUADRANT_ID}, "${NAME}", "${DESCRIPTION}", ${QUANTITY}, ${LENGTH}, ${WIDTH}, ${HEIGHT}, NOW(), NOW())`);
        uniq.queryNone(`UPDATE quadrants SET free_space = ${NEW_FREE_SPACE}, updated_at = NOW() WHERE id = ${QUADRANT_ID}`);
        const [PRODUCT] = await uniq.queryAll(`SELECT id FROM products ORDER BY id DESC LIMIT 1; `);
        uniq.queryNone(`
          INSERT INTO logs (user_id, username, product_id, product_name, operation, quantity, created_at, updated_at) 
          VALUES (${user.id}, "${user.username}" , ${PRODUCT.id}, "${NAME}", 'New', ${QUANTITY}, NOW(), NOW())
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

  async removeProduct(req,user) {
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
      uniq.queryNone(`
        INSERT INTO logs (user_id, username, product_id, product_name, operation, quantity, created_at, updated_at) 
        VALUES (${user.id}, "${user.username}" , ${PRODUCT_ID}, "${PRODUCT_NAME}", 'Remove', ${NEW_PRODUCT_QUANTITY}, NOW(), NOW())
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

  async updateProduct(req, user) {
    const {
      product_id,
      quadrant_id,
      product_name,
      product_quantity,
      product_description,
      length,
      width,
      height
    } = req.body;
  
    const newQuadrantId = parseInt(quadrant_id);
    const newQuantity = parseInt(product_quantity);
    const newLength = parseFloat(length);
    const newWidth = parseFloat(width);
    const newHeight = parseFloat(height);
    const newVolume = Math.round(newLength * newWidth * newHeight);
  
    if (!(product_id && newQuadrantId && product_name && !isNaN(newQuantity) && product_description)) {
      return 1; // Missing required fields
    }
  
    try {
    // Start a transaction
    await uniq.queryNone('BEGIN');

    // Fetch current product details and quadrant free space in one query
    const [productAndQuadrantResult] = await uniq.queryAll(`
      SELECT p.length, p.width, p.height, p.quantity, p.quadrant_id,
             q.free_space AS new_quadrant_free_space,
             (SELECT free_space FROM quadrants WHERE id = p.quadrant_id) AS current_quadrant_free_space
      FROM products p
      JOIN quadrants q ON q.id = ?
      WHERE p.id = ?
    `, [newQuadrantId, product_id]);
  
      const {
        length: currentLength,
        width: currentWidth,
        height: currentHeight,
        quantity: currentQuantity,
        quadrant_id: currentQuadrantId,
        new_quadrant_free_space,
        current_quadrant_free_space
      } = productAndQuadrantResult;
  
      const currentVolume = Math.round(currentLength * currentWidth * currentHeight);
      const quantityDifference = newQuantity - currentQuantity;
      const totalOccupiedSpace = newVolume * newQuantity - (currentQuadrantId === newQuadrantId ? currentVolume * currentQuantity : 0);
  
      if (new_quadrant_free_space - totalOccupiedSpace < 0) {
        await uniq.queryNone('ROLLBACK');
        return true; // Not enough free space in new quadrant
      }
  
      // Update the product
      await uniq.queryNone(`
        UPDATE products SET 
          quadrant_id = ?, 
          name = ?, 
          quantity = ?, 
          description = ?, 
          length = ?, 
          width = ?, 
          height = ? 
        WHERE id = ?
      `, [newQuadrantId, product_name, newQuantity, product_description, newLength, newWidth, newHeight, product_id]);
  
    // Log quantity change if applicable
    if (quantityDifference !== 0) {
      const operation = quantityDifference > 0 ? 'Add' : 'Subtract';
      await uniq.queryNone(`
        INSERT INTO logs (user_id, username, product_id, product_name, operation, quantity, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [user.id, user.username, product_id, product_name, operation, Math.abs(quantityDifference)]);
    }
  
      // Update free space in quadrants
      await uniq.queryNone(`
        UPDATE quadrants
        SET free_space = CASE
          WHEN id = ? THEN free_space - ?
          WHEN id = ? THEN free_space + ?
          ELSE free_space
        END
        WHERE id IN (?, ?)
      `, [newQuadrantId, totalOccupiedSpace, currentQuadrantId, currentVolume * currentQuantity, newQuadrantId, currentQuadrantId]);
  
      // Commit the transaction
      await uniq.queryNone('COMMIT');
  
      return 0; // Success
    } catch (error) {
      await uniq.queryNone('ROLLBACK');
      console.error('Error updating product:', error);
      return 2; // Database error
    }
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