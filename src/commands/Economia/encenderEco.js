const { db } = require("../../utils/database.js");

module.exports = {
  name: "encender",
  alias: ["prender", "on"],
  category: '💰 Economia',
  subcategory: "Configuración",
  use: "!encender",
  admin: true,

  async execute(sock, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const groupId = from.split("@")[0];
    const newState = true; // Assuming 'on' means true in your database schema

    try {
      await db.config.set(`${groupId}.config.economy`, newState);

      // Optionally, you can log the success
      console.log(`Economy enabled for group ${groupId}`);

      return sock.sendMessage(
        from,
        {
          text: `✅ La economía ha sido activada para este grupo.`,
        },
        { quoted: info }
      );
    } catch (error) {
      console.error("Error activando la economía:", error);

      return sock.sendMessage(
        from,
        {
          text: "❌ Ocurrió un error al intentar activar la economía.",
        },
        { quoted: info }
      );
    }
  },
};

  