import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, MessageFlags } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bloqueia o canal atual para todos os usuários, exceto administradores.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction){
        const channel = interaction.channel as TextChannel;

        if(!channel || !channel.isTextBased()){
            return interaction.reply({
                content: '❌ Este comando só pode ser usado em canais de texto.',
                flags: MessageFlags.Ephemeral
            });
        }

        try{
            await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
                SendMessages: false,
            });

            await interaction.reply(`🔒 Canal **${channel.name}** bloqueado para mensagens.`);
        }

        catch(error){
            console.error('Erro ao bloquear canal:', error);
            return interaction.reply({
                content: '❌ Ocorreu um erro ao tentar bloquear o canal.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}