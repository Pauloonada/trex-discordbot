import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, MessageFlags, PermissionFlagsBits } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Apaga várias mensagens de uma vez')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt =>
            opt.setName('quantidade')
                .setDescription('Número de mensagens para apagar (1-100')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction){
        const quantity = interaction.options.getInteger('quantidade', true);

        if(quantity < 1 || quantity > 100){
            return await interaction.reply({
                content: '❌ Você precisa escolher entre 1 e 100 mensagens.',
                flags: MessageFlags.Ephemeral
            });
        }

        if(!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages)){
            return await interaction.reply({
                content: '❌ Você não tem permissão para gerenciar mensagens.',
                flags: MessageFlags.Ephemeral
            });
        }

        const botHasPerm = interaction.channel && 'permissionsFor' in interaction.channel ? interaction.channel.permissionsFor(interaction.client.user!)?.has(PermissionsBitField.Flags.ManageMessages) : false;
        if (!botHasPerm) {
            return await interaction.reply({
                content: '❌ Eu não tenho permissão para apagar mensagens neste canal.',
                flags: MessageFlags.Ephemeral,
            });
        }

        let deletedMessages = null;
        if (interaction.channel && interaction.channel.type === 0) { // 0 = GuildText (TextChannel)
            // Type assertion to TextChannel
            const textChannel = interaction.channel as import("discord.js").TextChannel;
            deletedMessages = await textChannel.bulkDelete(quantity, true).catch(err => {
                console.error('Erro ao deletar mensagens:', err);
                return null;
            });
        }

        if(!deletedMessages || deletedMessages.size === 0){
            return await interaction.reply({
                content: '❌ Não consegui apagar as mensagens. Talvez elas sejam muito antigas ou não existam.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: `✅ Apaguei **${deletedMessages.size}** mensagens com sucesso!`,
            flags: MessageFlags.Ephemeral
        });
    }
}