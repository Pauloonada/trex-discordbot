import { SlashCommandBuilder } from 'discord.js';
import botStatus from '../../utils/botStatus.js';

export default {
  data: new SlashCommandBuilder()
    .setName('manutencao')
    .setDescription('Ativa ou desativa o modo de manutenção do bot.')
    .addBooleanOption(option =>
      option.setName('ativar')
        .setDescription('Ativar ou desativar a manutenção')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    // Verifica se o autor tem permissão de administrador
    if (!interaction.member.permissions.has('Administrator')) {
      return await interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true,
      });
    }

    const ativar = interaction.options.getBoolean('ativar');
    botStatus.setManutencao(ativar);

    await interaction.reply({
      content: `🔧 Modo de manutenção ${ativar ? 'ativado' : 'desativado'}.`,
      ephemeral: true,
    });
  }
};
