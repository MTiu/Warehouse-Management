/**
 * DOCU: Loads the Express Module in order for us
 * to set the app.
 */

const express = require('express');

/**
 * DOCU: Loads the Express Session Module in order for us
 * to set session data.
 */

const session = require('express-session');

/**
 * DOCU: Loads The body parser module which manages the post
 * and get data from the user.
 */

const bodyParser = require('body-parser');

/**
 * DOCU: Loads File System for file navigation.
 */

const fs = require('fs');

/**
 * DOCU: Loads Yaml module to access yaml files
 */

const yaml = require('js-yaml');

/**
 * DOCU: This loads the express ejs layouts.
 */

const expressLayouts = require('express-ejs-layouts');
/**
 * DOCU: Loads the Routes Module which handles all 
 * the users request it also handles the necessary controllers
 * for routing from view page to another.
 */

const mainRoutes = require('./routes/mainRoutes');

 /**
 * DOCU: Load middleware module 
 * Can be used to do global xss filtering and enable the profiler
 */

const middleware = require('./static/lib/middleware/middleware');

/**
 * DOCU: Load yaml file data to variable config
 */

const raw = fs.readFileSync('config.yaml');
const config = yaml.load(raw);

/**
 * DOCU: Checks if Redis Server is Enabled in Config
 */

const isRedisServerEnabled = config.redis_server.enable;
let myRedis = { store: undefined };

/**
 * DOCU: Loads and Stablish a redis connection.
 */

if(isRedisServerEnabled) {
    const redis = require('redis');
    const redisClient = redis.createClient({ legacyMode: true });
    const redisStore = require('connect-redis')(session);

    myRedis = { store: new redisStore({ host: config.redis_server.host, port: config.redis_server.port, client: redisClient, ttl: config.redis_server.tll })};
    
    redisClient.on('error', (err) => {
        console.log('Redis Server is not Running!');
    });
        
    redisClient.connect();
}

/**
 * DOCU: Creates an Express application and name it app. 
 * The express function is a top-level function exported by 
 * the express module.
 */

const app = express();

/**
 * DOCU: Using app to set view engine as ejs.
 * EJS is a node module with a PHP like syntax
 * and as the ability to write down data on the DOM.
 */

app.set('view engine', 'ejs');

/**
 * DOCU: Using app to set view engine as express ejs layouts.
 */

app.set(expressLayouts);

/**
 * DOCU: Define our static folder which contains
 * our image assets, javascript files, and stylesheets
 * NOTE: __dirname is our Current Directory name/path 
 * Which is "MAKING EXPRESS MVC" folder.
 */

app.use(express.static(__dirname + "/static/"));

/**
 * DOCU: Converts valid content type into a json readable format
 * extended: true precises that the req.body object will contain values 
 * of any type instead of just strings.
 */

app.use(bodyParser.urlencoded({ extended: true }));

/**
 * DOCU: Initialize our session data.
 */

app.use(session({
    secret: config.session_data.secret,
    name: config.session_data.name,
    resave: config.session_data.resave,
    saveUninitialized: config.session_data.saveUninitialized,
    cookie: { 
        maxAge: config.session_data.cookie.maxAge, 
        secure: config.session_data.cookie.secure 
    },
    store: myRedis.store
}));

/**
 * DOCU: Load the routes module in app.
 */

app.use(mainRoutes);

/**
 * DOCU: Use Middleware Logger that logs data to screen
 * Also called as Enabled Profiler
 */

app.use(middleware.logger);

/**
 * DOCU: The app listen for any changes in port number and update for 
 * any changes.
 */

app.listen(config.port, () => {
    console.log(`http://localhost:${ config.port }/`);
});




/**
 * 
    SETUP DATABASE CHIXXX
    PRODUCTS FORM
    QUADRANTS FORM
    SPACE FORM
    BACKLOGS

    CREATE POPUPS
    DISPLAY PRODUCTS CHIXXX
    DISPLAY QUADRANTS
    DISPLAY QUADRANT USAGE
    HISTORY
*/
