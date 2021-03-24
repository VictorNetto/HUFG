// Functions to allow or block class name and schedules

function validate_name(name) {
    // we just disallow empty strings as name
    return name !== ""
}

function validate_schedule(schedule) {
    const re = /^\s*[2-7]+[MTN]{1}[2-5]+\s*$/i

    const subSchedules = schedule.split(";")

    for (const subSchedule of subSchedules) {
        if (!re.test(subSchedule))
            return false
    }

    return true
}

export { validate_name, validate_schedule }