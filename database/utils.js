const path = require("path");
const database = require(path.join(__dirname, "initialize_database.js"));

function run_query(query, params=[]) {
    const stmt = database.prepare(query);
    try {
        return stmt.all(params);
    } catch (TypeError) {
        return stmt.run(params);
    }
}

module.exports = {
    run_query: run_query,
};