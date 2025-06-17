import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, MessageFlags } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Expulsa um usuário do servidor")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário a ser expulso')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo da expulsão')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction: ChatInputCommandInteraction){
        const targetUser = interaction.options.getMember('user') as GuildMember;
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

        if(!interaction.guild){
            return await interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', flags: MessageFlags.Ephemeral});
        }

        if(!targetUser){
            return await interaction.reply({ content: '❌ Usuário não encontrado.', flags: MessageFlags.Ephemeral });
        }

        if(targetUser.id === interaction.user.id){
            return await interaction.reply({ content: '❌ Você não pode se expulsar. Otário...', flags: MessageFlags.Ephemeral });
        }

        if(!targetUser.kickable){
            return await interaction.reply({ content: '❌ Eu não tenho permissão para expulsar este usuário.', flags: MessageFlags.Ephemeral });
        }

        try{
            await targetUser.send(`Você foi expulso de **${interaction.guild!.name}**. Motivo: ${reason}`).catch(() => null);
            await targetUser.kick(reason);

            await interaction.reply(`🔨 **${targetUser.user.username}** foi expulso com sucesso! Motivo: ${reason}`);
        }

        catch(error){
            console.error('Erro ao banir usuário:', error);
            return await interaction.reply({ content: `❌ Não foi possível expulsar **${targetUser.user.username}**.`, flags: MessageFlags.Ephemeral });
        }
    },
};