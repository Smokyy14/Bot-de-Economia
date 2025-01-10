const { convertTime } = require("../../utils/convertTime.js");

module.exports = {
  name: 'daily',
  alias: ["day"],
  use: "-daily",
  description: "Recibe tu recompensa diaria",
  category: "💰 Economia",
  subcategory: 'Economia',
  grupo: true,

  async execute(sock, msg, args) {
    const { db } = require("../../utils/database.js");
    
    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith('@g.us');
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const user = sender;
    const from = info.key.remoteJid;
    
    let timeout = 86400000;
    let amount = 100;
    
    let daily = await db.economy.get(`${from.split("@")[0]}.${user.split("@")[0]}.daily`);
    
    if (daily !== null && timeout - (Date.now() - daily) > 0) {
        let time = convertTime(timeout - (Date.now() - daily));
        
        const alreadyClaimed= `_Ya reclamaste tus monedas diarios._\n_Vuelve en:_ \`${time}\``;
        sock.sendMessage(from, {text: alreadyClaimed}, {quoted: info})
    } else {
        const claimed = `_*Reclamaste tus ${amount} monedas diarios.*_`;
        
        sock.sendMessage(from, {text: claimed}, {quoted: info})
        
        await db.economy.add(`${from.split("@")[0]}.${user.split("@")[0]}.money`, amount);
        await db.economy.set(`${from.split("@")[0]}.${user.split("@")[0]}.daily`, Date.now());
    }
  }
}
