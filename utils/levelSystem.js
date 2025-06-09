import db from '../db.js';

// Cooldown
const cooldown = new Map();

export default {
  name: 'levelSystem',
  async execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    const now = Date.now();
    const cooldownTime = 10000; // 10 seconds
    const key = `${userId}-${guildId}`;

    if (cooldown.has(key)) {
      const lastTime = cooldown.get(key);
      if (now - lastTime < cooldownTime) return;
    }

    cooldown.set(key, now);

    try {
      const res = await db.query(
        'SELECT * FROM users WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );

      if (res.rows.length === 0) {
        await db.query(
          'INSERT INTO users (user_id, guild_id, xp, level) VALUES ($1, $2, $3, $4)',
          [userId, guildId, 1, 0]
        );
        console.log(`🆕 Adicionado novo usuário: ${userId}`);
      } else {
        const currentXp = res.rows[0].xp;
        const oldLevel = res.rows[0].level;
        const newXP = currentXp + 1 + oldLevel; // Ganho por mensagem
        const newLevel = Math.floor(0.1 * Math.sqrt(newXP));

        await db.query(
          'UPDATE users SET xp = $1, level = $2 WHERE user_id = $3 AND guild_id = $4',
          [newXP, newLevel, userId, guildId]
        );

        if (newLevel > oldLevel) {
          message.channel.send(`🎉 ${message.author} subiu para o nível ${newLevel}!`);
        }
      }
    } catch (error) {
      console.error('Erro no sistema de níveis:', error);
    }
  }
};
