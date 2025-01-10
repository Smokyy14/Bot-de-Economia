module.exports = {
  name: 'transferir',
  alias: ['transfer'],
  use: '-transferir <monto> @usuario',
  description: 'Transfiere dinero a otro usuario.',
  category: '💰 Economia',
  subcategory: 'Economia',
  grupo: true,
  economy: true,

  async execute(sock, msg, args) {
    const { db } = require('../../utils/database.js');
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    const sender = info.key.participant; 
    const mentionedUsers = info.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentionedUsers.length === 0) {
      return sock.sendMessage(from, { text: 'Debes mencionar a un usuario para transferir dinero.' }, { quoted: info });
    }

    const recipient = mentionedUsers[0]; 
    const amount = parseInt(args[0]);

    // Validar monto
    if (isNaN(amount) || amount <= 0) {
      return sock.sendMessage(from, { text: 'Debes especificar una cantidad válida para transferir.' }, { quoted: info });
    }

    const senderBalance = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.bank`) || 0;
    if (senderBalance < amount) {
      return sock.sendMessage(from, { text: 'No tienes suficiente dinero para realizar esta transferencia.' }, { quoted: info });
    }

    await db.economy.sub(`${from.split('@')[0]}.${sender.split('@')[0]}.bank`, amount);
    await db.economy.add(`${from.split('@')[0]}.${recipient.split('@')[0]}.bank`, amount);

    const successMessage = `Has transferido ${amount.toLocaleString()} monedas a @${recipient.split('@')[0]}.`;
    sock.sendMessage(from, { text: successMessage, mentions: [recipient] }, { quoted: info });
  }
};
