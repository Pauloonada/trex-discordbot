import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel, MessageFlags } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloqueia o canal atual para todos os usuários.')
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
                SendMessages: true,
            });

            await interaction.reply(`🔓 Canal **${channel.name}** desbloqueado para mensagens.`);
        }

        catch(error){
            console.error('Erro ao desbloquear canal:', error);
            return interaction.reply({
                content: '❌ Ocorreu um erro ao tentar desbloquear o canal.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}