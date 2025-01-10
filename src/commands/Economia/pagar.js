module.exports = {
    name: 'pay',
    alias: ['pagar'],
    use: '-pay @usuario <cantidad>',
    description: 'Paga a otro usuario desde tu billetera.',
    category: '💰 Economia',
    subcategory: 'Economia',
    grupo: true,
    economy:  true,
    
    async execute(sock, msg, args) {
      const { db } = require('../../utils/database.js');
  
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith('@g.us');
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const from = info.key.remoteJid;
  
      const mentioned = msg.messages[0]?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const amount = parseInt(args[0]);
  
      if (!mentioned || mentioned.length === 0) {
        return sock.sendMessage(from, { text: 'Debes mencionar a alguien para pagarle.' }, { quoted: info });
      }
      if (isNaN(amount) || amount <= 0) {
        return sock.sendMessage(from, { text: 'Debes especificar una cantidad válida para pagar.' }, { quoted: info });
      }
  
      const target = mentioned[0]; 
      const senderWallet = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.money`) || 0;
  
      if (senderWallet < amount) {
        return sock.sendMessage(from, { text: 'No tienes suficiente dinero en tu billetera para realizar el pago.' }, { quoted: info });
      }
  
      await db.economy.sub(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, amount);
      await db.economy.add(`${from.split('@')[0]}.${target.split('@')[0]}.money`, amount);
  
      const successMessage = `Has pagado ${amount.toLocaleString()} monedas a @${target.split('@')[0]}.`;
      sock.sendMessage(from, { text: successMessage, mentions: [target] }, { quoted: info });
    }
  };
  
