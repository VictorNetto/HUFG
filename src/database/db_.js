const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./src/database/database.db")

module.exports = db

db.serialize( () => {
    // create a table
    db.run(`
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY,
            data TEXT
        );
    `)

    // // insert data
    // const query = `
    //     INSERT INTO schedules (
    //         id,
    //         data
    //     ) values (?,?);
    // `

    // const values = [
    //     0,
    //     `[{"id":"globalId-0","name":"AED2","classSchedule":[{"dayPeriod":"N","days":"5","timeChunk":"2345"}],"color":"#C0C0C0CC"},{"id":"globalId-1","name":"Arquitetura","classSchedule":[{"dayPeriod":"M","days":"35","timeChunk":"45"}],"color":"#FF0000CC"},{"id":"globalId-2","name":"Banco de Dados","classSchedule":[{"dayPeriod":"T","days":"25","timeChunk":"45"}],"color":"#800000CC"},{"id":"globalId-3","name":"Computação Gráfica","classSchedule":[{"dayPeriod":"T","days":"36","timeChunk":"45"}],"color":"#FFFF00CC"},{"id":"globalId-4","name":"LFA","classSchedule":[{"dayPeriod":"M","days":"35","timeChunk":"23"}],"color":"#808000CC"},{"id":"globalId-5","name":"POO","classSchedule":[{"dayPeriod":"T","days":"25","timeChunk":"23"}],"color":"#00FF00CC"},{"id":"globalId-6","name":"Teoria dos Grafos","classSchedule":[{"dayPeriod":"T","days":"36","timeChunk":"23"}],"color":"#008000CC"}]`
    // ]

    // db.run(query, values, (err) => {
    //     if (err) {
    //         return console.log(err)
    //     }

    //     console.log("Done")
    // })

    db.all(`SELECT * FROM schedules WHERE id=1`, (err, rows) => {
        if (err) {
            console.log(err)
        }
        
        if (rows.length > 0) {
            console.log("res: ", rows[0].data)
        }
    })
})