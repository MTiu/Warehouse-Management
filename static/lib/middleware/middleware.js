/**
 * Author: Arjhay Frias
 * Created_at: 03/31/2022
 * Updated_at: 04/09/2022
 * 
 * Description: Middleware.js Setup Profiler data and setup Global XSS Filtering
 * 
 */

const fs = require('fs');
const yaml = require('js-yaml');
const xssFilter = require('xss-filters');

const raw = fs.readFileSync('config.yaml');
const config = yaml.load(raw);

const isProfilerEnabled = config.enable_profiler;
const isGlobalXSSFilterEnabled = config.global_xss_filter;

class Middleware {
    /**DOCU: Middleware that logs session-data, get-post-variable, db-queries */
    logger(req, res, next) { 
        let session_data = {};
        let EnableProfiler = {};

        /**DOCU: Filters Users inputData
         * NOTE: Doesn't work well with async/await
         */
        if(isGlobalXSSFilterEnabled && req.session.body) {
            for(let i in req.session.body) {
                req.session.body[i] = xssFilter.inHTMLData(req.session.body[i]);
            }
        }

        /**DOCU: Filter other session data to reduce profiler confusion*/
        if(isProfilerEnabled) {
            for(let i in req.session) {
                if(i !== 'db_queries' && i !== 'cookie' && i !== 'body') {
                    session_data[i] = req.session[i]
                }
            }

            EnableProfiler = {
                'session-data': session_data,
                'get-variables': req.query,
                'post-variables': req.session.body,
                'db-queries': req.session.db_queries
            }

        } else {
            if(!isGlobalXSSFilterEnabled) {
                req.session.body = undefined;
            }
        }
        
        req.session.db_queries = [];
        res.locals.user = EnableProfiler;
        next();
    }
}

module.exports = new Middleware();