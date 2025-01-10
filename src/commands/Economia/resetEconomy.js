module.exports = {
  name: "reseteconomy",
  alias: ["reiniciareconomia"],
  use: "-reseteconomy",
  description: "Elimina la economía de todos los usuarios de este grupo.",
  category: "💰 Economia",
  subcategory: "Configuración",
  economy: true,
  admin: true,
  
  async execute(sock, msg, args) {
    const { db } = require("../../utils/database.js"); 
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    try {
      const groupKey = from.split("@")[0];
      await db.economy.delete(groupKey)

      return sock.sendMessage(
        from,
        {
          text: "✅ La economía ha sido reiniciada correctamente.",
        },
        { quoted: info }
      );
    } catch (error) {
      console.error("Error al resetear la economía:", error);
      return sock.sendMessage(
        from,
        { text: "❌ Ha ocurrido un error al intentar resetear la economía." },
        { quoted: info }
      );
    }
  },
};
