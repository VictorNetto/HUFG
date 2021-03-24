const express = require("express")
const db = require("./database/db")

const app = express()

// template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: app,
    noCache: true
})

// setup public folder
app.use(express.static("public"))

// enable req.body
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.render("main.html")
})

app.get("/horario/:schedule", (req, res) => {
    // schedule comes in base 36 and id get its value in base 10
    const id = Number.parseInt(req.params.schedule, 36)
    const data = db.prepare(`SELECT data FROM schedules WHERE id = ?`).get(id)

    if (data)
        res.render("main.html", { dataRequestUrl: `http://${req.headers.host}/get-data/${req.params.schedule}`})
    else
        res.send("Fail")
        
})

app.get("/get-data/:schedule", (req, res) => {
    // schedule comes in base 36 and id get its value in base 10
    const id = Number.parseInt(req.params.schedule, 36)
    const data = db.prepare(`SELECT data FROM schedules WHERE id = ?`).get(id)

    if (data)
        res.json(data)
    else
        res.send({})
        
})

app.post("/salvando", (req, res) => {
    // validate id
    let validId = false
    let id
    while (!validId) {
        id = Math.floor((Math.random() * 36**5))

        validId = (db.prepare(`SELECT id FROM schedules WHERE id = ?`).get(id) == undefined)

        // const info = db.prepare(`SELECT id FROM schedules WHERE id = ?`).run(id)
        // if (!info)
        //     validId = true
    }

    // save data
    const reqBodyData = req.body.data
    db.prepare("INSERT INTO schedules (id, data) VALUES (?, ?)").run(id, reqBodyData)

    // redirect to the correct url ending with id in base 36
    res.redirect(`/horario/${id.toString(36).padStart(5, "0")}`)
})

app.listen(3000)