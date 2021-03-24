import colors from "./colors.js"

// global variables for simplicity
let insertedClasses = []  // a list of all inserted classes
let globalId = 0  // used to differentiate classes and to choose a color for them

function build_class_schedule_object(dayPeriod, days, timeChunk) {
    return {
        dayPeriod: dayPeriod,
        days: days,
        timeChunk: timeChunk
    }
}

function build_class_object(id, name, schedule) {
    const currentColorIndex = globalId % colors.length
    const color = colors[currentColorIndex]

    let classObject = {
        id: id,
        name: name,
        classSchedule: [  // [ {}, {}, ...]
            // {
            //     dayPeriod: "",  // M, T, N
            //     days: "",       // 2...7
            //     timeChunk: "",   // 2...5
            // }
        ],
        color: color  // "#ff6712"
    }

    const scheduleChunks = schedule.split("<br/>")

    for (const item of scheduleChunks) {
        const Mindex = item.search("M")
        const Tindex = item.search("T")
        const Nindex = item.search("N")

        let dayPeriod = ""
        let days = ""
        let timeChunk = ""

        if (Mindex != -1) {
            dayPeriod = "M"
            days = item.slice(0, Mindex)
            timeChunk = item.slice(Mindex + 1)
            
        } else if (Tindex != -1) {
            dayPeriod = "T"
            days = item.slice(0, Tindex)
            timeChunk = item.slice(Tindex + 1)
    
        } else if (Nindex != -1) {
            dayPeriod = "N"
            days = item.slice(0, Nindex)
            timeChunk = item.slice(Nindex + 1)
        }

        classObject.classSchedule.push(build_class_schedule_object(dayPeriod, days, timeChunk))
    }

    return classObject
}

function getClassNameById(id) {
    for (let i = 0; i < insertedClasses.length; i++) {
        if (id == insertedClasses[i].id)
            return insertedClasses[i].name
    }

    return ""
}

function getColorById(id) {
    for (let i = 0; i < insertedClasses.length; i++) {
        if (id == insertedClasses[i].id)
            return insertedClasses[i].color
    }

    return "#ffffff"
}

function getIndexById(id) {
    for (let i = 0; i < insertedClasses.length; i++) {
        if (id == insertedClasses[i].id)
            return i
    }

    return -1
}

function update_globalId(newValue) {
    if (newValue)
        globalId = newValue
    else
        globalId++
}

export {
    insertedClasses, globalId,
    build_class_object,
    getClassNameById, getColorById, getIndexById,
    update_globalId
}