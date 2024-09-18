const moment = require('moment');

function getDateTimeDetails(date, time) {
    const now = moment().utc(); // Get the current time in UTC
    let dateTime = null;

    if (date && !time) {
        // If only date is provided, default the time to the current time (UTC)
        dateTime = moment.utc(date, 'YYYY-MM-DD').set({ hour: now.hour(), minute: now.minute() });
    } else if (time && !date) {
        // If only time is provided, default the date to today (UTC)
        dateTime = now.set({ hour: parseInt(time.split(':')[0], 10), minute: parseInt(time.split(':')[1], 10) });
    } else if (date && time) {
        // If both date and time are provided
        dateTime = moment.utc(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    } else {
        // If neither date nor time is provided
        return {
            dateTime: null,
            localTime: null,
            relativeTime: null
        };
    }

    return {
        dateTime: dateTime.format('YYYY-MM-DD HH:mm'),
        localTime: dateTime.local().format('X'), // UNIX timestamp for local time
        relativeTime: dateTime.unix()
    };
}

module.exports = { getDateTimeDetails };