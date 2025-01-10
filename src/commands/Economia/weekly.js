const { convertTime } = require("../../utils/convertTime.js");

module.exports = {
  name: 'weekly',
  alias: ["week"],
  use: "-weekly",
  description: "Recibe tu recompensa semanal.",
  category: "💰 Economia",
  grupo: true,
  economy:  true,
  
  async execute(sock, msg, args) {
    const { db } = require("../../utils/database.js");
    
    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith('@g.us');
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const user = sender;
    const from = info.key.remoteJid;
    
    let timeout = 604800000;
    let amount = 500;
    
    let weekly = await db.economy.get(`${from.split("@")[0]}.${user.split("@")[0]}.weekly`);
    
    if (weekly !== null && timeout - (Date.now() - weekly) > 0) {
        let time = convertTime(timeout - (Date.now() - weekly));
        
        const alreadyClaimed= `_Ya reclamaste tus monedas semanales._\n_Vuelve en_ \`${time}\``;
        sock.sendMessage(from, {text: alreadyClaimed}, {quoted: info})
    } else {
        const claimed = `_*Reclamaste tus ${amount} monedas semanales.*_`;
        
        sock.sendMessage(from, {text: claimed}, {quoted: info})
        
        await db.economy.add(`${from.split("@")[0]}.${user.split("@")[0]}.money`, amount);
        await db.economy.set(`${from.split("@")[0]}.${user.split("@")[0]}.weekly`, Date.now());
    }
  }
}