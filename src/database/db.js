const betterSqlite3 = require("better-sqlite3")
const db = betterSqlite3("./src/database/database.db")

module.exports = db

// const stmt = db.prepare("SELECT id FROM schedules WHERE id = 1")
// const info = stmt.get()

// if (info)
//     console.log(info.id)
// else
//     console.log("Fail")