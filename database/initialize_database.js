const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const database_path = process.env.database_path;
const Database = require('better-sqlite3');

const options = {
    readonly: false,
    fileMustExist: true,
    timeout: 5000,
    verbose: null
};

const database = new Database(database_path, options);

module.exports = database;
