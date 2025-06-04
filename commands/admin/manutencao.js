import { SlashCommandBuilder } from 'discord.js';
import botStatus from '../../utils/botStatus.js'
import { enviarLogWebhook } from '../../utils/webhookLogger.js';

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
    botStatus.setMaintenance(ativar);

    await interaction.reply({
      content: `🔧 Modo de manutenção ${ativar ? 'ativado' : 'desativado'}.\n🟡 Colocando o bot em modo de manutenção. Desligando...`,
      ephemeral: true,
    });

    // Loga no webhook antes de sair
    await enviarLogWebhook('🟡 Bot **desligado via comando** `/manutenção`.');

    // Aguarda 1 segundo só pra garantir envio
    setTimeout(() => process.exit(1), 1000);
  }
};
