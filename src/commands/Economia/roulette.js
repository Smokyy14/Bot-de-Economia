module.exports = {
  name: 'roulette',
  alias: ["ruleta"],
  use: "-roulette < color > < cantidad / all >",
  description: "Juega a la ruleta y apuesta tus monedas.",
  category: "💰 Economia",
  subcategory: 'Economia',
  grupo: true,
  economy: true,
  
  async execute(sock, msg, args) {
      const { db } = require("../../utils/database.js");
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith("@g.us");
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const from = info.key.remoteJid;
      const walletPath = `${from.split("@")[0]}.${sender.split("@")[0]}.money`;
      const cooldownPath = `${from.split("@")[0]}.${sender.split("@")[0]}.rouletteCooldown`;
      const cooldownTime = 3000; 
      const currentTime = Date.now();
      const lastUsed = await db.economy.get(cooldownPath) || 0;

      if (currentTime - lastUsed < cooldownTime) {
          const remainingTime = ((cooldownTime - (currentTime - lastUsed)) / 1000).toFixed(1);
          return sock.sendMessage(
              from, 
              { text: `⏳ Por favor, espera \`${remainingTime}s\` antes de usar este comando nuevamente.` }, 
              { quoted: info }
          );
      }

      const colors = ["rojo", "negro", "verde"];
      const multipliers = { rojo: 2, negro: 2, verde: 14 };
      const betColor = args[0]?.toLowerCase();
      const betAmountInput = args[1]?.toLowerCase();
      const walletBalance = await db.economy.get(walletPath) || 0;

      // Validaciones
      if (!colors.includes(betColor)) {
          return sock.sendMessage(from, { text: "⚠️ Debes elegir un color válido: `rojo`, `negro` o `verde`." }, { quoted: info });
      }

      const betAmount = betAmountInput === "all" ? walletBalance : parseInt(betAmountInput, 10);
      if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
          return sock.sendMessage(from, { text: "⚠️ Debes apostar una cantidad válida." }, { quoted: info });
      }
      if (betAmount > walletBalance) {
          return sock.sendMessage(from, { text: "⚠️ No tienes suficiente dinero en la billetera para apostar esa cantidad." }, { quoted: info });
      }

      // Reducir apuesta de la billetera
      await db.economy.sub(walletPath, betAmount);

      // Guardar la marca de tiempo del uso del comando
      await db.economy.set(cooldownPath, currentTime);

      // Resultado de la ruleta
      const rouletteResult = Math.floor(Math.random() * 37);
      const resultColor = rouletteResult === 0 ? "verde" : rouletteResult % 2 === 0 ? "negro" : "rojo";

      if (betColor === resultColor) {
          const multiplier = multipliers[betColor]; 
          const winnings = betAmount * multiplier; 
          await db.economy.add(walletPath, winnings); 
          sock.sendMessage(
              from,
              { 
                  text: `🎉 ¡La ruleta cayó en *${resultColor.toLowerCase()}*!\n` +
                        `Has ganado ${winnings.toLocaleString()} monedas.\n\n` +
                        `> *Multiplicador:*_ ${multiplier}x`
              },
              { quoted: info }
          );
      } else {
          sock.sendMessage(
              from,
              { 
                  text: `💔 La ruleta cayó en *${resultColor.toLowerCase()}*.\n` +
                        `Has perdido ${betAmount.toLocaleString()} monedas.` 
              },
              { quoted: info }
          );
      }
  }
}
