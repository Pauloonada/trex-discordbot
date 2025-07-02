import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import botStatus from '../../utils/botStatus.js'
import fs from 'fs';
import { enviarLogWebhook } from '../../utils/webhookLogger.js';

const owner = process.env.OWNER;

export default {
  data: new SlashCommandBuilder()
    .setName('manutencao')
    .setDescription('Ativa ou desativa o modo de manutenção do bot.')
    .addBooleanOption(option =>
      option.setName('ativar')
        .setDescription('Ativar ou desativar a manutenção')
        .setRequired(true)
    ),
  
  async execute(interaction: ChatInputCommandInteraction){
    const isDM = !interaction.guild;

    if(isDM){
      if(owner != interaction.user.id){
        return await interaction.reply({
          content: '❌ Você não tem permissão para usar esse comando.',
          ephemeral: true,
        });
      }
    }

    else{
      if(owner != interaction.member?.user.id){
        return await interaction.reply({
          content: '❌ Você não tem permissão para usar este comando.',
          ephemeral: true,
        });
      }
    }

    const ativar = interaction.options.getBoolean('ativar');
    botStatus.setMaintenance(ativar!);

    if(ativar){
      fs.writeFileSync('./.maintenance', 'manutencao ativa');
      await interaction.reply({
        content: '🔧 Bot entrando em manutenção...',
        ephemeral: true,
      });

      await enviarLogWebhook('🟡 Bot **desligado via comando** `/manutenção`.');
    }

    else{
      if(fs.existsSync('./.maintenance')){
        fs.unlinkSync('./.maintenance');
        await interaction.reply({
          content: '✅ Bot saindo do modo de manutenção.',
          ephemeral: true,
        });
      }
    }
  }
};
