import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Mostra informações sobre um usuário")
        .addUserOption(option =>
            option.setName("usuario")
                .setDescription("usuario para ver as informações")
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction){
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild?.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`📄 Informações de ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ size: 1024 }))
            .setColor(member?.displayHexColor || '#0099ff')
            .addFields(
                {
                name: '🆔 ID',
                value: user.id,
                inline: true
                },
                {
                name: '📛 Tag',
                value: `${user.tag}`,
                inline: true
                },
                {
                name: '📅 Conta criada em',
                value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`,
                inline: true
                },
                {
                name: '📆 Entrada no servidor',
                value: member
                    ? `<t:${Math.floor(member.joinedTimestamp! / 1000)}:f>`
                    : 'Não encontrado',
                inline: true
                },
                {
                name: '🎖️ Cargo mais alto',
                value: member?.roles.highest.name || 'Nenhum',
                inline: true
                }
            )
            .setFooter({
                text: `Solicitado por ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}