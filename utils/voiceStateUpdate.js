import db from '../db.js';
import voiceTimes from '../utils/voiceTracker.js';

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
          await db.query(
            'UPDATE users SET voice_seconds = $1 WHERE user_id = $2 AND guild_id = $3',
            [total, userId, guildId]
          );
        }

        console.log(`🎙️ ${userId} ficou ${seconds}s em call`);
      } 
      
      catch(error){
        console.error('Erro ao salvar tempo de voz:', error);
      }
    }
  }
};
