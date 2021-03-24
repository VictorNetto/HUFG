import { validate_name, validate_schedule } from "./validate.js"
import { insertedClasses, globalId } from "./classes.js"
import { build_class_object } from "./classes.js"
import { getClassNameById, getColorById, getIndexById } from "./classes.js"
import { update_globalId } from "./classes.js"

// ----------------------------------------------------------------------------
// Insertion place ------------------------------------------------------------
// ----------------------------------------------------------------------------

function sort_string(s) {
    return s.split("").sort().join("")
}

// make days and timeChunk of the schedule sorted
function normalize_schedule(schedule) {
    const scheduleChunks = schedule.split(";")

    // sort the content of days and timeChunk strings
    // "342" -> "234"
    for (let i = 0; i < scheduleChunks.length; i++) {
        const item = scheduleChunks[i]

        const index = Math.max(item.search("M"), item.search("T"), item.search("N"))
    
        const days = sort_string(item.slice(0, index))
        const timeChunk = sort_string(item.slice(index + 1))

        scheduleChunks[i] = days + item[index] + timeChunk
    }

    return scheduleChunks.join("<br/>")
}

// Remove logic ---------------------------------------------------------------
function remove_class_event(event) {
    let elementToRemove = document.getElementById("div-" + event.target.id)
    elementToRemove.remove()

    const insertedClassesIndex = getIndexById(event.target.id)
    if (insertedClassesIndex > -1)
        insertedClasses.splice(insertedClassesIndex, 1)
    
    update_save_button()
    update_display()
    update_server_data()
}

function setup_remove_class_event_listeners() {
    const removeButtons = document.querySelectorAll(".insertion-place .removable a")
    for (const button of removeButtons) {
        button.addEventListener("click", remove_class_event)
    }
}

// Add logic ------------------------------------------------------------------

const addButton = document.querySelector(".insertion-place .addble a")
const added = document.querySelector(".insertion-place #added")
const error_msg = document.querySelector(".insertion-place #error-msg")

addButton.addEventListener("click", (event) => {
    const name = document.querySelector(".insertion-place .addble #new-name")
    const schedule = document.querySelector(".insertion-place .addble #new-schedule")

    if (validate_name(name.value) && validate_schedule(schedule.value)) {
        const normalizedSchedule = normalize_schedule(schedule.value.toUpperCase())
        // Add a new class to the schedule
        added.innerHTML += `
        <div class="removable hoverable globalId-${globalId}" data-id="globalId-${globalId}" id="div-globalId-${globalId}">
            <div class="name"><h2>${name.value}</h2></div>
            <h2 class="schedule">${normalizedSchedule}</h2>
            <a href="#" id="globalId-${globalId}">-</a>
        </div>
        `
        // setup event callback
        setup_remove_class_event_listeners()

        insertedClasses.push(build_class_object("globalId-" + globalId, name.value, normalizedSchedule))

        update_save_button()
        update_display()
        update_server_data()

        // increment global id
        update_globalId()

        // Remove old information
        name.value = ""
        schedule.value = ""
    } else {
        error_msg.innerHTML = ""
        if (!validate_name(name.value))
            error_msg.innerHTML += `<h2>- Matéria não inserida</h2>`
        if (!validate_schedule(schedule.value))
            error_msg.innerHTML += `<h2>- Horário inválido</h2>`
            
        setTimeout(() => {
            error_msg.innerHTML = ""
        }, 2000)
    }
})

// ----------------------------------------------------------------------------
// Display --------------------------------------------------------------------
// ----------------------------------------------------------------------------

function get_classes_this_day(day) {
    let classesThisDay = [
        ["empty"], ["empty"], ["empty"], ["empty"],  // M
        ["interval"],
        ["empty"], ["empty"], ["empty"], ["empty"],  // T
        ["interval"],
        ["empty"], ["empty"], ["empty"], ["empty"]   // N
    ]

    for (const classObj of insertedClasses) {

        for (const classScheduleObj of classObj.classSchedule) {
            // checks if the class occurs this day in the current classScheduleObj
            if (classScheduleObj.days.search(day) == -1) continue

            let index = 0
            if (classScheduleObj.dayPeriod == "M") index += 0
            else if (classScheduleObj.dayPeriod == "T") index += 5
            else if (classScheduleObj.dayPeriod == "N") index += 10

            for (const item of classScheduleObj.timeChunk) {
                let indexModifier = 0
                if (item == "2") indexModifier += 0
                else if (item == "3") indexModifier += 1
                else if (item == "4") indexModifier += 2
                else if (item == "5") indexModifier += 3
    
                if (classesThisDay[index + indexModifier][0] == "empty")
                    classesThisDay[index + indexModifier][0] = classObj.id
                else
                    classesThisDay[index + indexModifier].push(classObj.id)
            }
        }
        
    }

    return classesThisDay
}

function deep_copy(a) {
    return JSON.parse(JSON.stringify(a))
}

// Build the schedule structure based on the classesThisDay array
// A schedule structure is something like
// [
//     {  // first half of the morning
//         type: "no-class",
//         classes: [],
//         duration: 6
//     },
//     {  // second half of the morning
//         type: "many-classes",
//         classes: ["class1_id", "class2_id"],  // 2 classes! It's a problem!
//         duration: 6
//     },
//     {
//         type: "interval",
//         classes: [],
//         duration: 2
//     },
//     {  // whole afternoon
//         type: "class",
//         classes: ["class3_id"],
//         duration: 12
//     },
//     {
//         type: "interval",
//         classes: [],
//         duration: 2
//     },
//     {  // hole night
//         type: "no-class",
//         classes: [],
//         duration: 12
//     }
// ]
function get_schedule_structure(classesThisDay) {
    let scheduleStructure = []

    let scheduleItem = {
        type: "",
        classes: [],
        duration: 0
    }

    for (let i = 0; i < classesThisDay.length; i++) {
        const item = classesThisDay[i];

        if (item[0] == "empty") {  // no class
            if (scheduleItem.type == "no-class") {
                // glue with the last item if it was a no-class as well
                scheduleItem.duration += 3
            } else {
                // save the scheduleItem if it isn't empty
                if (i > 0)
                    scheduleStructure.push(deep_copy(scheduleItem))
                
                // create a new no-class scheduleItem
                scheduleItem.type = "no-class"
                scheduleItem.classes = []
                scheduleItem.duration = 3
            }
        } else if (item[0] == "interval") {  // interval
            // save the scheduleItem
            // It't necessary not empty
            scheduleStructure.push(deep_copy(scheduleItem))
            
            // create a interval scheduleItem
            scheduleItem.type = "interval"
            scheduleItem.classes = []
            scheduleItem.duration = 2
        } else if (item.length == 1) {  // only 1 class
            if (scheduleItem.type == "class" && scheduleItem.classes[0] == item[0]) {
                // glue with the last item if it was the same class
                scheduleItem.duration += 3
            } else {
                // save the scheduleItem if it isn't empty
                if (i > 0)
                    scheduleStructure.push(deep_copy(scheduleItem))
                
                // create a new class scheduleItem
                scheduleItem.type = "class"
                scheduleItem.classes = item
                scheduleItem.duration = 3
            }
        } else {  // 2 or more classes
            // save the scheduleItem if it isn't empty
            if (i > 0)
                scheduleStructure.push(deep_copy(scheduleItem))
            
            // create a new many classes scheduleItem
            scheduleItem.type = "many-classes"
            scheduleItem.classes = item
            scheduleItem.duration = 3
        }
    }
    // save the scheduleItem one last time 
    scheduleStructure.push(deep_copy(scheduleItem))

    return scheduleStructure
}

function get_grid_template_rows(scheduleStructure) {
    if (scheduleStructure.length == 0) return ""

    let templateRows = scheduleStructure[0].duration + "fr"

    for (let i = 1; i < scheduleStructure.length; i++) {
        templateRows += " " + scheduleStructure[i].duration + "fr"
    }

    return templateRows
}

function get_html_content(scheduleStructure) {
    if (scheduleStructure.length == 0) return `<div class="empty"></div>`

    let htmlContent = ``

    for (let i = 0; i < scheduleStructure.length; i++) {
        if (scheduleStructure[i].type == "no-class") {
            htmlContent += `<div class="empty"></div>`
        } else if (scheduleStructure[i].type == "interval") {
            htmlContent += `<div class="empty"></div>`
        } else if (scheduleStructure[i].type == "class") {
            const whichClass = getClassNameById(scheduleStructure[i].classes[0])
            const color = getColorById(scheduleStructure[i].classes[0])
            const id = scheduleStructure[i].classes[0]
            htmlContent += `
                <div class="class hoverable ${id}" data-id="${id}" style="background-color: ${color};">
                    ${whichClass}
                </div>
            `
        } else if (scheduleStructure[i].type == "many-classes") {
            
        }
    }

    return htmlContent
}

function update_display() {
    const weekDays = "234567"

    for (const day of weekDays) {
        // keeps classes id of this day
        const classesThisDay = get_classes_this_day(day)
        const scheduleStructure = get_schedule_structure(classesThisDay)

        const gridTemplateRows = get_grid_template_rows(scheduleStructure)
        const htmlContent = get_html_content(scheduleStructure)

        const htmlElement = document.getElementById("day-" + day)

        htmlElement.style.gridTemplateRows = gridTemplateRows
        htmlElement.innerHTML = htmlContent
    }

    setup_hoverable_event_listeners()
}

// ----------------------------------------------------------------------------
// Hover logic ----------------------------------------------------------------
// ----------------------------------------------------------------------------

function setup_hoverable_event_listeners() {
    const hoverables = document.querySelectorAll(".hoverable")

    for (const hoverable of hoverables) {
        hoverable.addEventListener("mouseenter", (event) => {
            const element = event.target
            const relatedElements = document.querySelectorAll(`.${element.dataset.id}`)

            for (const item of relatedElements) {
                item.classList.add("hovering")
            }
        })

        hoverable.addEventListener("mouseleave", (event) => {
            const element = event.target
            const relatedElements = document.querySelectorAll(`.${element.dataset.id}`)

            for (const item of relatedElements) {
                item.classList.remove("hovering")
            }
        })
    }
}

// ----------------------------------------------------------------------------
// Save button ----------------------------------------------------------------
// ----------------------------------------------------------------------------

// enable or disable the save button based on the insertedClasses
function update_save_button() {
    const saveButton = document.getElementById("save")

    if (insertedClasses.length == 0) {
        saveButton.classList.add("disabled")
        saveButton.disabled = true
    } else {
        saveButton.classList.remove("disabled")
        saveButton.disabled = false
    }
}

// ----------------------------------------------------------------------------
// Server Data (client to server) ---------------------------------------------
// ----------------------------------------------------------------------------
function update_server_data() {
    const serverDataInput = document.querySelector("input[name=data]")

    serverDataInput.value = JSON.stringify(insertedClasses)
}

// ----------------------------------------------------------------------------
// Server Data (server to client) ---------------------------------------------
// ----------------------------------------------------------------------------
function get_normalizedSchedule(classObj) {
    let normalizedSchedule = ""

    for (const scheduleChunk of classObj.classSchedule) {
        normalizedSchedule += scheduleChunk.days
        normalizedSchedule += scheduleChunk.dayPeriod
        normalizedSchedule += scheduleChunk.timeChunk
        normalizedSchedule += "<br/>"
    }

    return normalizedSchedule
}

function update_added_html_content() {
    for (const classObj of insertedClasses) {
        // Add a new class to the schedule
        added.innerHTML += `
        <div class="removable hoverable ${classObj.id}" data-id="${classObj.id}" id="div-${classObj.id}">
            <div class="name"><h2>${classObj.name}</h2></div>
            <h2 class="schedule">${get_normalizedSchedule(classObj)}</h2>
            <a href="#" id="${classObj.id}">-</a>
        </div>
        `
    }

    // setup event callback
    setup_remove_class_event_listeners()
}

function setup_globalId() {
    let currentId, newId

    currentId = -1

    for (const classObj of insertedClasses) {
        // get the index of the first number
        // "globalId-1234" -> "...[1]234"
        let i = classObj.id.search("-") + 1

        // get the number
        newId = Number(classObj.id.slice(i))

        // currentId get the bigger id
        if (newId > currentId)
            currentId = newId
    }

    // globalId get the next available id
    update_globalId(newId + 1)
}

window.addEventListener("load", (event) => {
    if (dataRequestUrl.length == 0) return

    const request = new XMLHttpRequest()
    request.open("GET", dataRequestUrl)
    request.responseType = "json"
    request.send()

    request.onload = function() {
        const classes = JSON.parse(request.response.data)
        for (const classObj of classes) {
            insertedClasses.push(classObj)
        }

        update_added_html_content()

        // update_save_button()
        update_display()
        update_server_data()

        setup_globalId()

        console.log(classes)
        console.log(globalId)
    }
})