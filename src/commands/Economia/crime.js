const { convertTime } = require("../../utils/convertTime.js");

module.exports = {
  name: 'crime',
  alias: ["crimen"],
  use: "-crime",
  description: "Comete un crimen para obtener monedas.",
  category: "💰 Economia",
  grupo: true,
  economy: true,

  async execute(sock, msg, args) {
    const { db } = require("../../utils/database.js");

    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith('@g.us');
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const user = sender;
    const from = info.key.remoteJid;
    let timeout = 1800000;
    let amount = Math.floor(Math.random() * (284 - 162 + 1)) + 162;
    
    const crimes = [
        `_Grafiteaste una pared, fue un éxito y un propietario de la casa te dio \`${amount}\` monedas por tus habilidades._`,
        `_Te conectaste al WiFi del vecino y vendiste su contraseña por \`${amount}\` monedas._`,
        `_Te llevaste todas las decoraciones y regalos de un cumpleaños._\n_Ganaste \`${amount}\` monedas por revenderlos._`,
        `_Le robaste un peluche a tu primo y él pagó un rescate de \`${amount}\` monedas._`,
        `_Le robaste el bolso a una anciana.\n_En el bolso había \`${amount}\` monedas._`,
        `_Organizaste una carrera ilegal de caracoles._\n_Ironicamente, tu caracol fue más rápido._\n_Ganaste \`${amount}\` monedas._`,
        `_Le mentiste a tu jefe con que no te había pagado, obtuviste \`${amount}\` monedas._`,
        `_Robaste un carrito de helados y vendiste todo lo que había, incluido el carrito._\n_Ganaste \`${amount}\` monedas._`,
    ];

    let userCrime = crimes[Math.floor(Math.random() * crimes.length)]; // Selecciona un crimen aleatorio
    let Crime = await db.economy.get(`${from.split("@")[0]}.${user.split("@")[0]}.Crime`);

    if (Crime !== null && timeout - (Date.now() - Crime) > 0) {
        let time = convertTime(timeout - (Date.now() - Crime));
        const alreadyCrime = `Ya has cometido un crimen.\n_Vuelve en_ \`${time}\``;
        sock.sendMessage(from, { text: alreadyCrime }, { quoted: info });
    } else {
        sock.sendMessage(from, { text: userCrime }, { quoted: info }); // Muestra el crimen
        await db.economy.add(`${from.split("@")[0]}.${user.split("@")[0]}.money`, amount);
        await db.economy.set(`${from.split("@")[0]}.${user.split("@")[0]}.Crime`, Date.now());
    }
  },
};