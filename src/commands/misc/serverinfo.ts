import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Guild } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informações sobre o servidor atual.'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild as Guild;

        const { name, id, memberCount, createdAt, ownerId, description } = guild;

        const embed = new EmbedBuilder()
            .setTitle(`🏠 Informações do Servidor`)
            .setThumbnail(guild.iconURL({ size: 1024 }) || '')
            .setColor('#5865F2')
            .addFields(
                {
                    name: '📛 Nome',
                    value: name,
                    inline: true
                },
                {
                    name: '🆔 ID',
                    value: id,
                    inline: true
                },
                {
                    name: '👑 Dono',
                    value: `<@${ownerId}>`,
                    inline: true
                },
                {
                    name: '📅 Criado em',
                    value: `<t:${Math.floor(createdAt.getTime() / 1000)}:f>`,
                    inline: true
                },
                {
                    name: '📖 Descrição',
                    value: description || 'Sem descrição',
                    inline: true
                },
                {
                    name: '👥 Membros',
                    value: `${memberCount}`,
                    inline: true
                },
                {
                    name: '💬 Canais',
                    value: `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name: '🔐 Verificação',
                    value: `${['Nenhuma', 'Baixa', 'Média', 'Alta', 'Muito Alta'][guild.verificationLevel]}`,
                    inline: true
                },
                {
                    name: '🏷️ Cargos',
                    value: `${guild.roles.cache.size}`,
                    inline: true
                }
            )
            .setFooter({
                text: `Servidor criado`,
                iconURL: guild.iconURL() || undefined
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
