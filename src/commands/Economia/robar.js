const { convertTime } = require('../../utils/convertTime.js');

module.exports = {
  name: 'robar',
  alias: ['steal', 'rob'],
  use: '-robar @usuario',
  description: 'Roba monedas de la billetera de otro usuario.',
  category: '💰 Economia',
  grupo: true,
  economy:  true,
  
  async execute(sock, msg, args) {
    const { db } = require('../../utils/database.js');

    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith('@g.us');
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const from = info.key.remoteJid;

    if (!isGroup) {
      return sock.sendMessage(from, { text: 'Este comando solo funciona en grupos.' }, { quoted: info });
    }

    const mentioned = msg.messages[0]?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
      return sock.sendMessage(from, { text: 'Debes mencionar a alguien para robarle.' }, { quoted: info });
    }

    const target = mentioned[0]; 
    if (target === sender) {
      return sock.sendMessage(from, { text: 'No puedes robarte a ti mismo.' }, { quoted: info });
    }

    const cooldown = 1.08e+7
    const lastRobbery = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.lastRobbery`);

    if (lastRobbery && cooldown - (Date.now() - lastRobbery) > 0) {
      const time = convertTime(cooldown - (Date.now() - lastRobbery));
      return sock.sendMessage(from, { text: `Ya robaste recientemente.\nIntenta de nuevo en \`${time}\`.` }, { quoted: info });
    }

    const thiefWallet = await db.economy.get(`${from.split('@')[0]}.${sender.split('@')[0]}.money`) || 0;
    const victimWallet = await db.economy.get(`${from.split('@')[0]}.${target.split('@')[0]}.money`) || 0;

    if (thiefWallet < 500) {
      return sock.sendMessage(from, { text: 'Necesitas al menos 500 monedas en tu billetera para poder robar.' }, { quoted: info });
    }

    if (victimWallet === 0) {
      return sock.sendMessage(from, { text: 'El usuario mencionado no tiene dinero en su billetera para robar.' }, { quoted: info });
    }

    const stolenPercentage = Math.random() * (70 - 45) + 45; 
    const stolenAmount = Math.floor((victimWallet * stolenPercentage) / 100);

    await db.economy.sub(`${from.split('@')[0]}.${target.split('@')[0]}.money`, stolenAmount);
    await db.economy.add(`${from.split('@')[0]}.${sender.split('@')[0]}.money`, stolenAmount);
    await db.economy.set(`${from.split('@')[0]}.${sender.split('@')[0]}.lastRobbery`, Date.now());

    const successMessage = `¡Robo exitoso! 🕶️\n` +
      `Le has robado ${stolenAmount.toLocaleString()} MoonCoins a @${target.split('@')[0]}.\n\n` +
      `*Tu billetera actual:* ${thiefWallet + stolenAmount} MoonCoins 💸\n` +
      `*Billetera de la víctima:* ${victimWallet - stolenAmount} MoonCoins.`;

    sock.sendMessage(from, { text: successMessage, mentions: [target] }, { quoted: info });
  }
};
