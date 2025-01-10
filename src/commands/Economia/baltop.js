module.exports = {
    name: 'baltop',
    alias: ['leaderboard', 'lb'],
    use: '-baltop',
    description: 'Muestra un leaderboard económico del grupo.',
    category: '💰 Economia',
    subcategory: 'Economia',
    economy:  true,
    grupo: true,

    async execute(sock, msg, args) {
      const { db } = require('../../utils/database.js');
      const info = msg.messages[0];
      const from = info.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
  
      if (!isGroup) {
        return sock.sendMessage(from, { text: '⚠️ Este comando solo puede usarse en grupos.' }, { quoted: info });
      }
  
      const groupMetadata = await sock.groupMetadata(from);
      const groupMembers = groupMetadata.participants.map((member) => member.id);
  
      let economyData = [];
  
      for (const memberId of groupMembers) {
        const wallet = await db.economy.get(`${from.split('@')[0]}.${memberId.split('@')[0]}.money`) || 0;
        const bank = await db.economy.get(`${from.split('@')[0]}.${memberId.split('@')[0]}.bank`) || 0;
        const total = wallet + bank;
  
        if (total > 0) {
          economyData.push({ id: memberId, total });
        }
      }
  
      if (economyData.length === 0) {
        return sock.sendMessage(from, { text: '⚠️ Ningún miembro tiene dinero en la economía.' }, { quoted: info });
      }
  
      // Ordenar por total de dinero (descendente)
      economyData.sort((a, b) => b.total - a.total);
  
      // Crear el leaderboard
      const leaderboard = economyData
        .map((user, index) => `${index + 1}. @${user.id.split('@')[0]} - ${user.total.toLocaleString()} monedas`)
        .join('\n');
  
      // Enviar el mensaje
      sock.sendMessage(from, {
        text: `🏆 *Leaderboard del Grupo:*\n\n${leaderboard}`,
        mentions: economyData.map(user => user.id),
      }, { quoted: info });
    },
  };
  
