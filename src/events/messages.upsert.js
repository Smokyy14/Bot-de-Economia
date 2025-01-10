module.exports = {
  name: "messages.upsert",

  async load(msg, sock) {
    if (msg.type !== "notify") return;
    const { message: ctx, key } = msg.messages[0];
    require("../utils/messageUtils")(sock, msg);
      
    const btn = ctx?.templateButtonReplyMessage || ctx?.buttonsResponseMessage;
    if (btn && typeof btn === "object") {
      const selected = btn?.selectedId || btn?.selectedButtonId;
      const [id, ...args] = selected.split("+");

      const component = sock.components.get(id);
      if (!component) return;

      return component.execute(sock, msg, args);
    }

    let userId = key.remoteJid;

    const body =
      ctx?.extendedTextMessage?.text ||
      ctx?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      ctx?.conversation ||
      ctx?.imageMessage?.caption ||
      ctx?.videoMessage?.caption;

    if (body === "prefix" || body === "prefijo") {
      return msg.reply("_Mi prefijo es:_ `!`");
    }

    if (!body || !["!"].some((prefix) => body.startsWith(prefix)) || body.length <= 1) return;

    const args = body.slice(1).trim().split(" ");
    const label = args.shift().toLowerCase();

    const command = sock.commands.find(
      ({ name, alias }) => name === label || alias?.includes(label)
    );

    if (!command) {
      return msg.reply("```Comando no existente.```");
    }

    if (command.economy) {
      const isEconomyActive = await isEconomyEnabled(key.remoteJid);
      if (key.remoteJid.includes("@g.us") && !isEconomyActive) {
        return sock.sendMessage(key.remoteJid, {
          text: "La economía está deshabilitada en este grupo.\nPidele a un administrador que la active con:\n```!encender```",
          quoted: msg.messages[0],
        });
      }
    }
      
    if (command.dev && !sock.config.dev.includes(userId)) {
      return msg.reply("```Este comando es solo para desarrolladores.```");
    }

    // Admin-only command in group chat
    if (key.remoteJid.includes("@g.us") && command.admin) {
      const grupoMetadata = await sock.groupMetadata(key.remoteJid);
      const grupoAdmins = grupoMetadata.participants
        .filter((participant) => participant.admin === "admin" || participant.admin === "superadmin")
        .map((admin) => admin.id);

      if (!grupoAdmins.includes(key.participant)) {
        return sock.sendMessage(key.remoteJid, {
          text: "Este comando solo está disponible para administradores.",
          quoted: msg.messages[0],
        });
      }
    }

    try {
      await command.execute(sock, msg, args);
    } catch (error) {
      msg.reply("Ocurrió un error al ejecutar el comando.").then(() => {
        console.error(error);
      });
    }
  async function isEconomyEnabled(groupId) {
  		const { db } = require("../utils/database.js");
  		const groupIdNumeric = groupId.split("@")[0];
  		const groupState = (await db.config.get(`${groupIdNumeric}.config.economy`)) ?? false;
  		return groupState === true;
}
  },
};
