module.exports = {
  name: "help",
  alias: ["h", "hcomm"],
  category: "Información",
  use: "!help [comando]",
  description: "Muestra la información detallada de un comando específico.",
  
  async execute(sock, msg, args) {
    const messageInfo = msg.messages ? msg.messages[0] : null;
    const remoteJid = messageInfo?.key?.remoteJid;
    const commandName = args[0];
    
    if (!commandName) {
      return sock.sendMessage(
        remoteJid,
        { text: "Por favor, especifica el comando para ver su ayuda.\nEjemplo: `-help menu`" },
        { quoted: messageInfo }
      );
    }

    const command = sock.commands.find(
      (cmd) => cmd.name === commandName || (cmd.alias && cmd.alias.includes(commandName))
    );

    if (!command) {
      return sock.sendMessage(
        remoteJid,
        { text: `_El comando \`${commandName}\` no existe._\n_Por favor, verifica el nombre._`},
        { quoted: messageInfo }
      );
    }

    const { name, alias, use, description } = command;
    	let responseText = `*Ayuda para el comando:* \`${name}\`\n\n`;
    		responseText += `*Uso:* ${use}\n\n`;
    	if (alias && alias.length > 0) {
    		responseText += `*Alias:* ${alias.join(", ")}\n\n`;}
	    	responseText += `*Descripción:* ${description}\n\n`;

    sock.sendMessage(remoteJid, { text: responseText }, { quoted: messageInfo });
  },
};