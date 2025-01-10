module.exports = {
    name: 'deposit',
    alias: ['dep', 'depositar'],
    use: '-deposit <cantidad | all>',
    description: 'Deposita monedas desde la billetera al banco.',
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

      const depositAmount = args[0]?.toLowerCase() === 'all' ? 'all' : parseInt(args[0]);
      if (!depositAmount || (depositAmount !== 'all' && isNaN(depositAmount))) {
        return sock.sendMessage(from, { text: 'Por favor especifica una cantidad válida para depositar.' }, { quoted: info });
      }
  
      const wallet = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.money`) || 0;
      const bank = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.bank`) || 0;
  
      const amountToDeposit = depositAmount === 'all' ? wallet : depositAmount;
      if (amountToDeposit > wallet) {
        return sock.sendMessage(from, { text: 'No tienes suficiente dinero en la billetera para depositar esa cantidad.' }, { quoted: info });
      }
  
      await db.economy.sub(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, amountToDeposit);
      await db.economy.add(`${from.split('@')[0]}.${sender.split('@')[0]}.bank`, amountToDeposit);
  
      const depositMessage = `Has depositado ${amountToDeposit.toLocaleString()} monedas en tu banco.\n\n` +
        `*Billetera actual:* ${(wallet - amountToDeposit).toLocaleString()} monedas 💸\n` +
        `*Banco actual:* ${(bank + amountToDeposit).toLocaleString()} monedas 🏦\n\n`;
  
      sock.sendMessage(from, { text: depositMessage }, { quoted: info });
    }
  };
  
