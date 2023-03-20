// Load dependencies.
const connection = require('../config/database').connection;

// select, join, custom_where, group_by, order_by,
// limit, limit_start, get_first, get_count

// Schema model.
const table = connection.query('SHOW COLUMNS FROM tasks;', function(err, results) {
    table.name = 'tasks';
    table.primaryKey = 'id';
    table.columns = results.map(e => e.Field);
});

// Export modules.
module.exports = {
    search: function(params) {
        return new Promise(function(resolve, reject) {
            try
            {
                if(typeof params !== 'object') return resolve(null);

                // Select.
                let select_string = '';

                if(typeof params.select !== 'undefined')
                {
                    select_string = params.select;
                }
                else
                {
                    if(typeof params.join !== 'undefined')
                    {
                        // This table name.
                        table.columns.forEach(e => {
                            if(select_string != '')
                            {
                                select_string += ', ';
                            }

                            select_string += `${table.name}.${e} AS '${table.name}::${e}'`;
                        });

                        // Join table name.
                        for(let key in params.join)
                        {
                            const join = connection.query(`SHOW COLUMNS FROM ${key};`, function(err, results) {
                                join.table_name = key;
                                join.table_columns = results.map(e => e.Field);
                            });

                            join.table_columns.forEach(e => {
                                if(select_string != '')
                                {
                                    select_string += ', ';
                                }
                                
                                select_string += `${join.table_name}.${e} AS '${join.table_name}::${e}'`;
                            });
                        }
                    }
                    else
                    {
                        select_string = table.columns.join(', ');
                    }
                }

                // Join.
                let join_string = '';

                if(typeof params.join !== 'undefined')
                {
                    for(let key in params.join)
                    {
                        if(join_string != '')
                        {
                            join_string += ' ';
                        }
                        
                        join_string += `LEFT JOIN ${key} ON ${params.join[key]}`;
                    }
                }

                // SQL query command.
                let sql = `SELECT ${select_string} FROM ${table.name}`;

                if(join_string != '')                           sql += ` ${join_string}`;
                if(typeof params.custom_where !== 'undefined')  sql += ` WHERE ${params.custom_where}`;
                if(typeof params.group_by !== 'undefined')      sql += ` GROUP BY ${params.group_by}`;
                if(typeof params.order_by !== 'undefined')      sql += ` ORDER BY ${params.order_by}`;
                if(typeof params.limit !== 'undefined')
                {
                    if(typeof params.limit_start === 'undefined')
                    {
                        params.limit_start = 0;
                    }

                    sql += ` LIMIT ${params.limit_start}, ${params.limit}`;
                }
                
                // Query.
                connection.query(
                    `${sql};`,
                    (err, results) => {
                        if(err) {
                            return reject(err);
                        }
                        else if(typeof params.get_first !== 'undefined' && params.get_first == true) {
                            if(results.length > 0) {
                                return resolve(results[0]);
                            }
                            else {
                                return resolve(null);
                            }
                        }
                        else if(typeof params.get_count !== 'undefined' && params.get_count == true) {
                            return resolve(results.length);
                        }
                        else {
                            return resolve(results);
                        }
                    }
                );
            }
            catch(err)
            {
                return reject(err);
            }
        });
    },
    find: function(id) {
        return new Promise(function(resolve, reject) {
            try
            {
                if(!Number.isInteger(id)) return resolve(null);

                connection.query(
                    `SELECT * FROM ${table.name} WHERE ${table.primaryKey} = ?;`,
                    [id],
                    (err, results) => {
                        if(err) {
                            return reject(err);
                        }
                        else if(results.length == 1) {
                            return resolve(results[0]);
                        }
                        else {
                            return resolve(null);
                        }
                    }
                );
            }
            catch(err)
            {
                return reject(err);
            }
        });
    },
    create: function(params) {
        return new Promise(function(resolve, reject) {
            try
            {
                if(typeof params !== 'object' || Object.keys(params).length == 0 || typeof params[table.primaryKey] !== 'undefined')
                {
                    return resolve(null);
                }

                // Map columns and values.
                let k = [];
                let v = [];

                for(let key in params)
                {
                    if(params.hasOwnProperty(key) && table.columns.includes(key))
                    {
                        k.push(key);
                        v.push(params[key]);
                    }
                }
                
                // Insert.
                connection.query(
                    `INSERT INTO ${table.name}(${k.join(', ')}) VALUES (${v.map(e => '?').join(', ')});`,
                    v,
                    (err, results) => {
                        if(err) {
                            return reject(err);
                        }
                        else {
                            return resolve(results.insertId);
                        }
                    }
                );
            }
            catch(err)
            {
                return reject(err);
            }
        });
    },
    update: function(params, update = {}) {
        return new Promise(function(resolve, reject) {
            try
            {
                if(typeof params !== 'object' || Object.keys(params).length == 0) return resolve(null);
                
                // Map columns and values.
                let k = [];
                let v = [];

                for(let key in params)
                {
                    if(key == table.primaryKey)
                    {
                        continue;
                    }
                    else if(params.hasOwnProperty(key) && table.columns.includes(key))
                    {
                        k.push(key);
                        v.push(params[key]);
                    }
                }

                // Set.
                let set_string = k.join(' = ?, ');
                if(set_string != '') set_string += ' = ?';

                // SQL update command.
                let sql = `UPDATE ${table.name} SET ${set_string}`;
                
                if(typeof params[table.primaryKey] !== 'undefined') sql += ` WHERE ${table.primaryKey} = ${params[table.primaryKey]}`;
                else if(typeof update.custom_where !== 'undefined') sql += ` WHERE ${update.custom_where}`;
                else return resolve(null);

                // Update.
                connection.query(
                    `${sql};`,
                    v,
                    (err, results) => {
                        if(err) {
                            return reject(err);
                        }
                        else {
                            return resolve(results.changedRows);
                        }
                    }
                );
            }
            catch(err)
            {
                return reject(err);
            }
        });
    },
    delete: function(params) {
        return new Promise(function(resolve, reject) {
            try
            {
                if(typeof params !== 'object' || typeof params.custom_where !== 'string') return resolve(null);

                connection.query(
                    `DELETE FROM ${table.name} WHERE ${params.custom_where};`,
                    (err, results) => {
                        if(err) {
                            return reject(err);
                        }
                        else {
                            return resolve(results.affectedRows);
                        }
                    }
                );
            }
            catch(err)
            {
                return reject(err);
            }
        });
    }
};
