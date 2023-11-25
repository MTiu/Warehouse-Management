/**
 * Author: Arjhay Frias
 * Created_at: 03/31/2022
 * Updated_at: 04/09/2022
 * 
 * Description: Universal Query allows user to migrate to multiple database without changing codebase 
 * Supports mySQL & postgreSQL 
 */

 const db = require('../../../connection');
 const fs = require('fs');
 const yaml = require('js-yaml');
 
 const raw = fs.readFileSync('config.yaml');
 const config = yaml.load(raw);
 
 const isProfilerEnabled = config.enable_profiler;
 const db_name = config.database.name.toLowerCase();
 
 class UniversalQuery {
     /**DOCU: Used for all types of query  */
     queryAll(query, values, req) {
         if(isProfilerEnabled) {
             req.session.db_queries.push(query);
         }
 
         if(db_name == 'postgres' || db_name == 'postgresql') { 
             return db.any(query, values);
         } else if(db_name == 'mysql') {
             const myQuery = db.format(query, values);
             
             return new Promise((resolve, reject) => {
                 db.query(myQuery, (err, result) => {
                     if(err) {
                         return reject(err);
                     }
                     return resolve(result);
                 });	
             })
         }
     }
 
     /**DOCU: Used for no return queries */
     queryNone(query, values, req) {
         if(isProfilerEnabled) {
             req.session.db_queries.push(query);
         }
 
         if(db_name == 'postgres' || db_name == 'postgresql') { 
             db.none(query, values);
         } else if(db_name == 'mysql') {
             const myQuery = db.format(query, values);
 
             db.query(myQuery);
         }
     }
 }
 
 module.exports = new UniversalQuery();