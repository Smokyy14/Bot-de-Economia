module.exports = {
    name: 'withdraw',
    alias: ['wd', 'retirar'],
    use: '-withdraw <cantidad | all>',
    description: 'Retira monedas del banco a tu billetera.',
    category: '💰 Economia',
    grupo: true,
    economy:  true,
    
    async execute(sock, msg, args) {
      const { db } = require('../../utils/database.js');
  
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith('@g.us');
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const from = info.key.remoteJid;
  
      const withdrawAmount = args[0]?.toLowerCase() === 'all' ? 'all' : parseInt(args[0]);
      if (!withdrawAmount || (withdrawAmount !== 'all' && isNaN(withdrawAmount))) {
        return sock.sendMessage(from, { text: 'Por favor especifica una cantidad válida para retirar o usa "all".' }, { quoted: info });
      }
  
      const wallet = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.money`) || 0;
      const bank = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.bank`) || 0;

      const amountToWithdraw = withdrawAmount === 'all' ? bank : withdrawAmount;
      if (amountToWithdraw > bank) {
        return sock.sendMessage(from, { text: 'No tienes suficiente dinero en el banco para retirar esa cantidad.' }, { quoted: info });
      }
  
      
      await db.economy.add(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, amountToWithdraw);
      await db.economy.sub(`${from.split('@')[0]}.${sender.split('@')[0]}.bank`, amountToWithdraw);
  
       withdrawMessage = `Has retirado ${amountToWithdraw.toLocaleString()} monedas de tu banco.\n\n` +
        `*Billetera actual:* ${(wallet + amountToWithdraw).toLocaleString()} monedas 💸\n` +
        `*Banco actual:* ${(bank - amountToWithdraw).toLocaleString()} monedas 🏦\n\n` +
        `> ¡Ten cuidado! Hay ladrones por doquier...`;
  
      sock.sendMessage(from, { text: withdrawMessage }, { quoted: info });
    }
  };
  