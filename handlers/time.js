function generateTimeChoices() {
    const choices = [];
    for (let hour = 0; hour <= 23; hour++) {
        const timeString = hour.toString().padStart(2, '0') + ':00'; // Format as HH:00
        choices.push({ name: timeString, value: timeString });
    }
    return choices;
}

module.exports = generateTimeChoices;