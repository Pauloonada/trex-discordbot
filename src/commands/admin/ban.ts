import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, MessageFlags } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bane um usuário do servidor")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário a ser banido')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo do banimento')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('dias')
                .setDescription('Número de dias de mensagens a serem apagadas do usuário (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction: ChatInputCommandInteraction){
        const targetUser = interaction.options.getMember('user') as GuildMember;
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const days = interaction.options.getInteger('dias') || 0;

        if(!interaction.guild){
            return await interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', flags: MessageFlags.Ephemeral});
        }

        if(!targetUser){
            return await interaction.reply({ content: '❌ Usuário não encontrado.', flags: MessageFlags.Ephemeral });
        }

        if(targetUser.id === interaction.user.id){
            return await interaction.reply({ content: '❌ Você não pode se banir. Otário...', flags: MessageFlags.Ephemeral });
        }

        if(!targetUser.bannable){
            return await interaction.reply({ content: '❌ Eu não tenho permissão para banir este usuário.', flags: MessageFlags.Ephemeral });
        }

        try{
            await targetUser.send(`Você foi banido de **${interaction.guild!.name}**. Motivo: ${reason}`).catch(() => null);
            await targetUser.ban({ reason: reason, deleteMessageDays: days });

            await interaction.reply(`🔨 **${targetUser.user.username}** foi banido com sucesso! Motivo: ${reason} (Mensagens apagadas nos últimos ${days} dias).`);
        }

        catch(error){
            console.error('Erro ao banir usuário:', error);
            return await interaction.reply({ content: `❌ Não foi possível banir **${targetUser.user.username}**.`, flags: MessageFlags.Ephemeral });
        }
    },
};