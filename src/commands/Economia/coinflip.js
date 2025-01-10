module.exports = {
    name: 'coinflip',
    alias: ['cf', 'moneda'],
    use: '-coinflip < cantidad / all >',
    description: 'Juega a lanzar una moneda para duplicar tu apuesta o perderla.',
    category: '💰 Economia',
    grupo: true,
    economy:  true,
    
    async execute(sock, msg, args) {
        const { db } = require('../../utils/database.js');

        const info = msg.messages[0];
        const sender = info.key.remoteJid.endsWith('@g.us') 
            ? info.key.participant 
            : info.key.remoteJid;
        const from = info.key.remoteJid;

        const bet = args[0] === 'all' 
            ? await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.money`) || 0
            : parseInt(args[0], 10);

        if (!bet || isNaN(bet) || bet <= 0) {
            sock.sendMessage(from, { 
                text: 'Debes apostar una cantidad válida de MoonCoins.' 
            }, { quoted: info });
            return;
        }

        const wallet = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.money`) || 0;
        if (bet > wallet) {
            sock.sendMessage(from, { 
                text: 'No tienes suficientes monedas para esta apuesta.' 
            }, { quoted: info });
            return;
        }

        const isWin = Math.random() < 0.5;
        const resultMessage = isWin 
            ? `¡Felicidades! La moneda cayó de tu lado.\nGanaste ${bet.toLocaleString()} monedas. 🤑` 
            : `Lo siento 😢, perdiste ${bet.toLocaleString()} monedas. Mejor suerte la próxima vez.`;

        // Actualizar economía
        if (isWin) {
            await db.economy.add(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, bet);
        } else {
            await db.economy.sub(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, bet);
        }

        // Enviar resultado
        sock.sendMessage(from, { 
            text: resultMessage 
        }, { quoted: info });
    }
};
