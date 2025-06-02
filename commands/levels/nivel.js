import { SlashCommandBuilder } from 'discord.js';
import db from '../../db.js'; // Ajusta o caminho se estiver diferente

export default{
  data: new SlashCommandBuilder()
    .setName('nivel')
    .setDescription('Veja seu nível, XP e tempo em call')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Usuário para ver o nível')
        .setRequired(false)
    ),

  async execute(interaction){
    const user = interaction.options.getUser('user') || interaction.user;
    const userId = user.id;
    const guildId = interaction.guild.id;

    try{
      const res = await db.query(
        'SELECT * FROM users WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );

      if(res.rows.length === 0){
        return interaction.reply({
          content: `❌ Não encontrei dados para ${user.username}.`,
          ephemeral: true
        });
      }

      const { xp, level, voice_seconds } = res.rows[0];
      const tempoFormatado = formatSeconds(voice_seconds || 0);

      await interaction.reply({
        content: `📊 **Nível de ${user.username}**
• 🧪 XP: ${xp}
• 🆙 Nível: ${level}
• 🕒 Tempo em call: ${tempoFormatado}`,
        ephemeral: false
      });

    }
    
    catch(error){
      console.error('Erro ao buscar nível:', err);
      await interaction.reply({
        content: '❌ Erro ao buscar o nível!',
        ephemeral: true
      });
    }
  }
};

// Função auxiliar para formatar segundos em hh:mm:ss
function formatSeconds(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}
