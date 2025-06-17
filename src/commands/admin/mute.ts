import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, MessageFlags } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute temporario para um usuário")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário a ser mutado')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('tempo')
                .setDescription('Tempo em minutos para o mute')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction: ChatInputCommandInteraction){
        const member = interaction.options.getMember('user') as GuildMember;
        const muteTime = interaction.options.getInteger('tempo', true);
        const muteRole = interaction.guild?.roles.cache.find(role => role.name.toUpperCase() === 'MUTED' || role.name.toUpperCase() === 'MUTADO');

        if(!member || !muteRole){
            return await interaction.reply({ content: '❌ Usuário ou cargo de mute não encontrado.', flags: MessageFlags.Ephemeral });
        }

        try{
            await member.roles.add(muteRole);
            await interaction.reply({ content: `🔇 ${member.user.username} foi mutado por ${muteTime} minutos.`, flags: MessageFlags.Ephemeral });

            setTimeout(async() => {
                if(member.roles.cache.has(muteRole.id)){
                    try{
                        await member.roles.remove(muteRole);
                        console.log(`🔊 ${member.user.username} foi desmutado após ${muteTime} minutos.`);
                    }
                    catch(error){
                        console.error(`❌ Erro ao remover o cargo de mute de ${member.user.username}:`, error);
                    }
                }
            }, muteTime * 60 * 1000); // Minutes to Milliseconds
        }

        catch(error){
            console.error(`❌ Erro ao mutar ${member.user.username}:`, error);
            return await interaction.reply({ content: `❌ Não foi possível mutar ${member.user.username}.`, flags: MessageFlags.Ephemeral });
        }
    },
};