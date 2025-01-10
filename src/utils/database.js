const { QuickDB } = require("quick.db");
const path = require("path");
const dbFilePath = path.join(process.cwd(), "database", "database.sqlite");
const db = {
    economy : new QuickDB({ table: "economy", filePath: dbFilePath }),
    config  : new QuickDB({ table: "grupos" , filePath: dbFilePath }),
};

module.exports = { db };