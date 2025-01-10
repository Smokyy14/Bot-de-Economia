module.exports = {
    name: "join",
    alias: ["unirme"],
    use: "!join < enlace >",
    description: "Me permite unirme a tus grupos",
    category: "Une a tu bot a tus grupos favoritos.",
    premium: true,
    
    execute: async (sock, msg, args) => {
      const groupLink = args[0]; 
  
        const remoteJid = msg.messages[0].key.remoteJid;
  
        if (remoteJid.endsWith('@g.us')) {
              return sock.sendMessage(remoteJid, { text: "Este comando no funciona en grupos." });
          }
        
      if (!groupLink) {
        return sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Por favor, proporciona un enlace valido.\n_Uso correcto:_ -join [enlace]",
        });
      }
  
      // Extraer la parte clave del enlace para unirse al grupo (la parte después de "chat.whatsapp.com/")
      const inviteCode = groupLink.split('chat.whatsapp.com/')[1];
  
      if (!inviteCode) {
        return sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: "El enlace proporcionado no es válido.",
        });
      }
  
      try {
        const response = await sock.groupAcceptInvite(inviteCode);
        
        if (response) {
          sock.sendMessage(msg.messages[0].key.remoteJid, {
            text: "Me he unido exitosamente a tu grupo.",
          });
        } else {
          sock.sendMessage(msg.messages[0].key.remoteJid, {
            text: "He enviado solicitud para que me unas a tu grupo.",
          });
        }
  
      } catch (error) {
        console.error(error);
        sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ocurrió un error al intentar unirme al grupo.\nIntenta de nuevo más tarde.",
        });
      }
    },
  };