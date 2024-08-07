
// const fs = require('fs');
// const yaml = require('js-yaml');

// const raw = fs.readFileSync('config.yaml');
// const config = yaml.load(raw);

// const db_name = config.database.name.toLowerCase();
// if(db_name == 'postgres' || db_name == 'postgresql') {
//     const pgp = require('pg-promise')();
    
//     module.exports = pgp(`postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`);
// } else if(db_name == 'mysql') {
//     const mysql = require('mysql2');

//     module.exports = mysql.createConnection({
//         "host": config.database.host,
//         "user": config.database.user,
//         "password": config.database.password,
//         "database": config.database.database,
//         "port": config.database.port
//     });
// }

const fs = require('fs');
const yaml = require('js-yaml');

let config;

if (process.env.NODE_ENV === 'production') {
    // Render environment
    config = {
        database: {
            name: process.env.DB_NAME,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        }
    };
} else {
    // Local environment
    const raw = fs.readFileSync('config.yaml');
    config = yaml.load(raw);
}

const db_name = config.database.name.toLowerCase();
if(db_name === 'postgres' || db_name === 'postgresql') {
    const pgp = require('pg-promise')();
    module.exports = pgp(`postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`);
} else if(db_name === 'mysql') {
    const mysql = require('mysql2');
    module.exports = mysql.createConnection({
        "host": config.database.host,
        "user": config.database.user,
        "password": config.database.password,
        "database": config.database.database,
        "port": config.database.port
    });
}