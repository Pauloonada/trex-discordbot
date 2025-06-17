import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, MessageFlags } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Remove o mute de um usuário")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário a ser desmutado')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction: ChatInputCommandInteraction){
        const member = interaction.options.getMember('user') as GuildMember;
        const muteRole = interaction.guild?.roles.cache.find(role => role.name.toUpperCase() === 'MUTED' || role.name.toUpperCase() === 'MUTADO');

        if(!member || !muteRole){
            return await interaction.reply({ content: '❌ Usuário ou cargo de mute não encontrado.', flags: MessageFlags.Ephemeral });
        }

        try{
            if(!member.roles.cache.has(muteRole.id)){
                return await interaction.reply({
                    content: `❌ ${member.user.username} não está mutado.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await member.roles.remove(muteRole);
            await interaction.reply({ content: `🔊 ${member.user.username} foi desmutado com sucesso.`, flags: MessageFlags.Ephemeral });
        }

        catch(error){
            console.error(`❌ Erro ao desmutar ${member.user.username}:`, error);
            return await interaction.reply({ content: `❌ Não foi possível desmutar ${member.user.username}.`, flags: MessageFlags.Ephemeral });
        }
    },
};