import db from '../db.js';
import voiceTimes from '../utils/voiceTracker.js';
import { enviarEmbedWebhook } from '../utils/webhookLogger.js';
import { EmbedBuilder, VoiceState } from 'discord.js';

export default{
  name: 'voiceStateUpdate',
  async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const member = newState.member;
    const userId = member!.id;
    const guildId = member!.guild.id;

    // Entrou em call
    if(!oldState.channel && newState.channel){
      voiceTimes.set(userId, Date.now());
    }

    // Saiu da call
    if(oldState.channel && !newState.channel){
      const joinedAt = voiceTimes.get(userId);
      if (!joinedAt) return;

      const totalSeconds = Math.floor((Date.now() - joinedAt) / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Exemplo de exibição:
      const formatedTime = `${hours}h ${minutes}min ${seconds}s`;

      const xpGained = Math.floor(totalSeconds / 300); // 1XP / 5 Minutes
      voiceTimes.delete(userId);

      try{
        const res = await db.query(
          'SELECT * FROM user_guild_data WHERE user_id = $1 AND guild_id = $2',
          [userId, guildId]
        );

        if(res.rows.length === 0){
          await db.query(
            'INSERT INTO users (id) VALUES ($1) on conflict do nothing',
            [userId]
          );

          await db.query(
            ` INSERT INTO user_guild_data (user_id, guild_id, voice_seconds) VALUES ($1, $2, $3)
              ON CONFLICT (user_id, guild_id) DO UPDATE SET voice_seconds = EXCLUDED.voice_seconds`,
              [userId, guildId, totalSeconds]
          );
        }
        
        else{
          const total = res.rows[0].voice_seconds + totalSeconds;

          const currentXp = res.rows[0].xp;
          const oldLevel = res.rows[0].level;
          const newXP = currentXp + (xpGained * Math.floor(oldLevel / 2)); // Ganho por voz
          const newLevel = Math.floor(0.1 * Math.sqrt(newXP));

          await db.query(
            'UPDATE user_guild_data SET voice_seconds = $1, xp = $2, level = $3 WHERE user_id = $4 AND guild_id = $5',
            [total, newXP, newLevel, userId, guildId]
          );

          if(newLevel > oldLevel){
            const channel = member?.guild.channels.cache.find(
              ch => ch.name === 'geral' && ch.isTextBased && ch.isTextBased()
            );
            if (channel && channel.isTextBased && channel.isTextBased()) {
              channel.send(`🎉 ${member} subiu para o nível ${newLevel} por voz!`);
            }
          }
        }
        const embed = new EmbedBuilder()
          .setTitle('🎙️ Tempo de Voz Registrado')
          .setDescription(`${member} ficou **${hours} horas, ${minutes} minutos e ${seconds} segundos** em call.`)
          .setColor('#00ff00')
          .setFields(
            { name: 'Usuário', value: `${member!.user.tag} (\`${userId}\`)`, inline: true },
            { name: 'Servidor', value: `${member!.guild.name} (\`${guildId}\`)`, inline: true },
            { name: 'XP ganho', value: `${xpGained}`, inline: true },
            { name: 'Total de voz essa sessão:', value: `${formatedTime}`, inline: true }
          )
          .setTimestamp();

        console.log(`🎙️ ${userId} ficou ${formatedTime} em call`);
        await enviarEmbedWebhook(embed).catch(console.error);
      } 
      
      catch(error){
        console.error('Erro ao salvar tempo de voz:', error);
      }
    }
  }
};
