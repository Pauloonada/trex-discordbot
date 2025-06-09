import db from '../db.js';
import voiceTimes from '../utils/voiceTracker.js';
import { enviarEmbedWebhook } from '../utils/webhookLogger.js';

export default{
  name: 'voiceStateUpdate',
  async execute(oldState, newState){
    const member = newState.member;
    const userId = member.id;
    const guildId = member.guild.id;

    // Entrou em call
    if(!oldState.channel && newState.channel){
      voiceTimes.set(userId, Date.now());
    }

    // Saiu da call
    if(oldState.channel && !newState.channel){
      const joinedAt = voiceTimes.get(userId);
      if (!joinedAt) return;

      const seconds = Math.floor((Date.now() - joinedAt) / 1000);
      const xpGained = Math.floor(seconds / 90); // 1XP / Minute and a half
      voiceTimes.delete(userId);

      try{
        const res = await db.query(
          'SELECT * FROM users WHERE user_id = $1 AND guild_id = $2',
          [userId, guildId]
        );

        if(res.rows.length === 0){
          await db.query(
            'INSERT INTO users (user_id, guild_id, voice_seconds) VALUES ($1, $2, $3)',
            [userId, guildId, seconds]
          );
        }
        
        else{
          const total = res.rows[0].voice_seconds + seconds;

          const currentXp = res.rows[0].xp;
          const oldLevel = res.rows[0].level;
          const newXP = currentXp + (xpGained * oldLevel); // Ganho por voz
          const newLevel = Math.floor(0.1 * Math.sqrt(newXP));

          await db.query(
            'UPDATE users SET voice_seconds = $1, xp = $2, level = $3 WHERE user_id = $4 AND guild_id = $5',
            [total, newXP, newLevel, userId, guildId]
          );

          if(newLevel > oldLevel){
            const channel = member.guild.channels.cache.find(ch => ch.name === 'geral');
            if(channel) channel.send(`🎉 ${member} subiu para o nível ${newLevel} por voz!`);
          }
        }
        const embed = new EmbedBuilder()
          .setTitle('🎙️ Tempo de Voz Registrado')
          .setDescription(`${member} ficou **${seconds} segundos** em call.`)
          .setColor('#00ff00')
          .setFields(
            { name: 'Usuário', value: `${member.user.tag} (\`${userId}\`)`, inline: true },
            { name: 'Servidor', value: `${member.guild.name} (\`${guildId}\`)`, inline: true },
            { name: 'XP ganho', value: `${xpGained}`, inline: true },
            { name: 'Total de voz essa sessão:', value: `${seconds} segundos`, inline: true }
          )
          .setTimestamp();

        console.log(`🎙️ ${userId} ficou ${seconds}s em call`);
        await enviarEmbedWebhook(embed).catch(console.error);
      } 
      
      catch(error){
        console.error('Erro ao salvar tempo de voz:', error);
      }
    }
  }
};
