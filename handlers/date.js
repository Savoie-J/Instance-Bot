function generateDateChoices() {
    const choices = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        choices.push({ name: dateString, value: dateString });
    }
    return choices;
}

module.exports = generateDateChoices;