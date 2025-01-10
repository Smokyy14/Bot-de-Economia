const { convertTime } = require("../../utils/convertTime.js");

module.exports = {
  name: 'work',
  alias: ["trabajar"],
  use: "-work",
  description: "Trabaja para obtener monedas.",
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
    let timeout = 1800000;
    let amount = Math.floor(Math.random() * (492 - 197 + 1)) + 197;
    const works = [
        `_Programaste algo de codigo y obtuviste \`${amount}\` monedas._`,
        `_Vendiste repuestos de auto y obtuviste \`${amount}\` monedas._`,
        `_Vendiste discos de musica y obtuviste \`${amount}\` monedas._`,
        `_Cantaste en los autobuses y te dieron \`${amount}\` monedas._`,
        `_Limpiaste autos sin dejar rayas en los cristales._\n_Recibiste \`${amount}\` monedas por tu esfuerzo._`,
        `_Reparaste máquinas en tiempo récord y los jugadores te dieron un premio por tu tiempo._\n_Ganaste \`${amount}\` monedas._`,
        `_Te abriste un negocio pizzero, los clientes las catalogan "Las mejores del mercado"._\n_Ganaste \`${amount}\` monedas._`,
        `_Te hiciste niñero y cuidaste a 5 niños en un solo dia._\n_Ganaste \`${amount}\` monedas._`,
        `_Entregaste 10 pizzas a tiempo y recibiste una buena propina._\n_Ganaste \`${amount}\` monedas._`
    ];
    const userWork = works[Math.floor(Math.random() * works.length)];
    let worked = await db.economy.get(`${from.split("@")[0]}.${user.split("@")[0]}.worked`);
    
    if (worked !== null && timeout - (Date.now() - worked) > 0) {
        let time = convertTime(timeout - (Date.now() - worked));
        const alreadyWorked = `_Ya has trabajado._\n_Vuelve en_ \`${time}\``;
        sock.sendMessage(from, {text: alreadyWorked}, {quoted: info})
    } else {
        const work = `${userWork}`;
        sock.sendMessage(from, {text: work}, {quoted: info})
        
        await db.economy.add(`${from.split("@")[0]}.${user.split("@")[0]}.money`, amount);
        await db.economy.set(`${from.split("@")[0]}.${user.split("@")[0]}.worked`, Date.now());
    }
  }
}