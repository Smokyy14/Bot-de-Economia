module.exports = {
    name: 'balance',
    alias: ['bal', 'billetera'],
    use: '-balance [@usuario]',
    description: 'Muestra la balanza económica de un usuario.',
    category: '💰 Economia',
    grupo: true,
    economy: true,
    
    async execute(sock, msg, args) {
      const { db } = require('../../utils/database.js');
  
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith('@g.us');
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const from = info.key.remoteJid;
  
      const mentioned = isGroup && info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const targetUser = mentioned || sender;
  
      const wallet = await db.economy.get(`${from.split('@')[0]}.${targetUser.split('@')[0]}.money`) || 0;
      const bank = await db.economy.get(`${from.split('@')[0]}.${targetUser.split('@')[0]}.bank`) || 0;
      const total = wallet + bank;
  
      const userTag = targetUser.split('@')[0];
      const balanceMessage = `*Billetera de @${userTag}:*\n\n` +
        `*Billetera:* ${wallet.toLocaleString()} monedas 💸\n` +
        `*Banco:* ${bank.toLocaleString()} monedas 🏦\n` +
        `*Total:* ${(total).toLocaleString()} monedas 💰`;
  
      sock.sendMessage(from, { 
        text: balanceMessage, 
        mentions: [targetUser]
      }, { quoted: info });
    }
  };
  