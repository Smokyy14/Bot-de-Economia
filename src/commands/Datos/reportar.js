module.exports = {
    name: "reporte",
    use: "!reporte [contenido]",
    description: "Envia reportes de comandos al creador del bot.",
    category: "Información",
    
    async execute(sock, msg, args) {
        const info = msg.messages[0];
        const { remoteJid } = info.key;

        if (remoteJid.endsWith("@g.us")) {
            return msg.reply("Este comando no se puede usar en grupos.");
        }    
		const message = args.join(" ");
        const userName = info.pushName || "Usuario desconocido";
        const userNumber = remoteJid.split('@')[0];
        const MoonConsole = `*Reporte sobre el encargo #1:*\n${message}\n\n*Enviado por:* ${userName}`;
        const formattedMessage = `*Reporte sobre el encargo #1:*\n${message}\n\n*Enviado por:* @${userNumber}`;
        
        if (!message) {
            return msg.reply("Tu reporte no puede estar vacío.")
        }
        try {
            await sock.sendMessage('120363362572158307@g.us', {
                text: formattedMessage,
                mentions: [remoteJid]
            });
            await sock.sendMessage('120363343328695431@g.us', {
                text: MoonConsole
            });
            return sock.sendMessage(remoteJid, { text: `Reporte enviado a Smoky con éxito.` });
        } catch (error) {
            console.error(error);
            return sock.sendMessage(remoteJid, { text: "Hubo un error al enviar el mensaje." });
        }
    }
};
