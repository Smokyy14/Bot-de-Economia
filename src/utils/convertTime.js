function convertTime(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let timeString = [];
    if (days > 0) timeString.push(`${days} día${days !== 1 ? 's' : ''}`);
    if (hours > 0) timeString.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) timeString.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0) timeString.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`);

    return timeString.join(', ');
}

module.exports = { convertTime };
