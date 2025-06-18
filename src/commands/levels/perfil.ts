import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { gerarImagemNivel } from '../../utils/levelCard.js';
import db from '../../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Veja seu nível, XP, tempo em call e cargos')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Usuário para se consultar')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;
    let member;

    try {
      member = await interaction.guild!.members.fetch(targetUser.id);
    } catch (err) {
      console.error('Erro ao buscar membro da guilda:', err);
      interaction.editReply({
        content: `❌ Não foi possível encontrar ${targetUser.username}.`
      });
    }

    const userId = member!.id;
    const guildId = interaction.guild!.id;

    try {
      console.log('⛏️ Buscando no banco...');
      const res = await db.query(
        'SELECT * FROM user_guild_data WHERE user_id = $1 AND guild_id = $2',
        [userId, guildId]
      );
      console.log('✅ Dados retornados!');

      if (res.rows.length === 0) {
        interaction.editReply({
          content: `❌ Não encontrei dados para ${targetUser.username}.`
        });
      }

      const { xp, level, voice_seconds } = res.rows[0];
      const tempoFormatado = formatSeconds(voice_seconds || 0);
      const cargos = member!.roles.cache
        .filter(r => r.id !== interaction.guild?.id)
        .sort((a, b) => b.position - a.position)
        .map(r => r.name);

      let imagem;
      try {
        console.log('Chamando gerarImagemNivel...');
        imagem = await gerarImagemNivel(member!, level, xp, tempoFormatado, cargos);
        console.log('Imagem gerada!');
      } catch (err) {
        console.error('Erro ao gerar imagem de nível:', err);
        interaction.editReply({ content: '❌ Erro ao gerar a imagem de nível!' });
      }

      await interaction.editReply({
        content: `📊 Perfil de ${member!.user.username}`,
        files: [imagem!],
      });

    } catch (error) {
      console.error('Erro ao buscar nível:', error);
      await interaction.editReply({
        content: '❌ Erro ao buscar o nível!'
      });
    }
  }
};

// Função auxiliar para formatar segundos em hh:mm:ss
function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}
