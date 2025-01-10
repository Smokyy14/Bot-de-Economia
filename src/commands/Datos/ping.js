module.exports = {
  name: "ping",
  use: "!ping",
  description: "Mide la latencia del bot.",
  category: "Información",
  async execute(sock, msg, _) {
      
    const start = Date.now();
    await sock.sendMessage(msg.messages[0].key.remoteJid, {
      text: "¡Pong!",
    });
    const end = Date.now();

    msg.reply(`\`${end - start}ms\``);
  },
};
