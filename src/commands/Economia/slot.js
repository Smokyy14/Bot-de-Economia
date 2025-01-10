module.exports = {
    name: 'slot',
    alias: ['slots', 'maquina'],
    use: '-slot < cantidad >',
    description: 'Juega a la máquina tragamonedas y prueba tu suerte.',
    category: '💰 Economia',
    subcategory: 'Economia',
    grupo: true,
    economy: true,
    
    async execute(sock, msg, args) {
        const { db } = require('../../utils/database.js');
        const info = msg.messages[0];
        const sender = info.key.remoteJid.endsWith('@g.us')
            ? info.key.participant
            : info.key.remoteJid;
        const from = info.key.remoteJid;

        const isPreferredUser = preferredUsers.includes(sender);

        const cooldownPath = `${from.split('@')[0]}.${sender.split('@')[0]}.slotCooldown`;
        const cooldownTime = 3000; 
        const currentTime = Date.now();
        const lastUsed = await db.economy.get(cooldownPath) || 0;
        
        if (currentTime - lastUsed < cooldownTime) {
            const remainingTime = ((cooldownTime - (currentTime - lastUsed)) / 1000).toFixed(1);
            return sock.sendMessage(
                from,
                { text: `⏳ Por favor, espera \`${remainingTime}s\` antes de usar este comando nuevamente.` },
                { quoted: info }
            );
        }

        await db.economy.set(cooldownPath, currentTime);

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

        // Tabla de multiplicadores y emojis
        const multipliers = {
            '🍒': 2,
            '🍋': 2,
            '🍇': 3,
            '🔔': 5,
            '💎': 10,
            '💲': 15,
            '👑': 20,
            '🏆': 25,
            '🪙': 50,
        };
        const slots = ['🍒', '🍋', '🍇', '🔔', '💎', '💲', '👑', '🏆', '🪙'];
        const result = Array.from({ length: 3 }, () => slots[Math.floor(Math.random() * slots.length)]);

        const emojiCounts = result.reduce((counts, emoji) => {
            counts[emoji] = (counts[emoji] || 0) + 1;
            return counts;
        }, {});

        let multiplier = 0;
        for (const [emoji, count] of Object.entries(emojiCounts)) {
            if (count === 3) {
                multiplier = multipliers[emoji]; 
                break;
            } else if (count === 2) {
                multiplier = multipliers[emoji] / 0.5; 
            }
        }

        const winAmount = Math.floor(bet * multiplier);
        const winMessage = multiplier > 0
            ? `🎰 | ${result.join(' | ')} | 🎰\n\n¡Felicidades! Ganaste ${winAmount.toLocaleString()} monedas.\nMultiplicador: x${multiplier.toFixed(1)}.`
            : `🎰 | ${result.join(' | ')} | 🎰\n\nHas perdido ${bet.toLocaleString()} monedas.\n¡Inténtalo de nuevo!`;

        if (multiplier > 0) {
            await db.economy.add(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, winAmount);
        } else {
            await db.economy.sub(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, bet);
        }

        sock.sendMessage(from, { text: winMessage }, { quoted: info });
    }
};
