const { db } = require("../../utils/database.js");

module.exports = {
  name: "apagar",
  alias: ["off", "desactivar"],
  category: '💰 Economia',
  subcategory: "Configuración",
  use: "!apagar",
  admin: true,
  grupo: true,
    
  async execute(sock, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const groupId = from.split("@")[0];
    const newState = false; 

    try {
      await db.config.set(`${groupId}.config.economy`, newState);

      // Optionally, you can log the success
      console.log(`Economy disabled for group ${groupId}`);

      return sock.sendMessage(
        from,
        {
          text: `✅ La economía ha sido desactivada para este grupo.`,
        },
        { quoted: info }
      );
    } catch (error) {
      console.error("Error desactivando la economía:", error);

      return sock.sendMessage(
        from,
        {
          text: "❌ Ocurrió un error al intentar desactivar la economía.",
        },
        { quoted: info }
      );
    }
  },
};
