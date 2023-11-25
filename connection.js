/**
 * Author: Arjhay Frias
 * Created_at: 03/31/2022
 * Updated_at: 04/09/2022
 * 
 * Description: Config.js Handles all the Database Configuration
 * 
 */

const fs = require('fs');
const yaml = require('js-yaml');

const raw = fs.readFileSync('config.yaml');
const config = yaml.load(raw);

const db_name = config.database.name.toLowerCase();
if(db_name == 'postgres' || db_name == 'postgresql') {
    const pgp = require('pg-promise')();
    
    module.exports = pgp(`postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`);
} else if(db_name == 'mysql') {
    const mysql = require('mysql2');

    module.exports = mysql.createConnection({
        "host": config.database.host,
        "user": config.database.user,
        "password": config.database.password,
        "database": config.database.database,
        "port": config.database.port
    });
}