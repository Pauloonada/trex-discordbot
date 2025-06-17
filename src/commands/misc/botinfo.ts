import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default{
    data: new SlashCommandBuilder().setName('botinfo').setDescription('Mostra informações sobre o bot'),

    async execute(interaction: ChatInputCommandInteraction){
        const client = interaction.client;

        const upTimeMs = client.uptime ?? 0;
        const upTimeSeconds = Math.floor(upTimeMs / 1000);
        const upTimeMinutes = Math.floor(upTimeSeconds / 60);
        const upTimeHours = Math.floor(upTimeMinutes / 60);
        const upTimeDays = Math.floor(upTimeHours / 24);

        const embed = new EmbedBuilder()
            .setTitle('🤖 Informações do Bot')
            .setColor('#0b1693')
            .setThumbnail(client.user?.displayAvatarURL() || '')
            .addFields(
                {
                    name: '🆔 Nome',
                    value: client.user?.username.toString(),
                    inline: true
                },
                {
                    name: '📡 Ping',
                    value: client.ws.ping.toString() + 'ms',
                    inline: true
                },
                {
                    name: '🕒 Uptime',
                    value: `${upTimeDays}d ${upTimeHours}h ${upTimeMinutes}m ${upTimeSeconds}s`,
                    inline: true
                },
                {
                    name: '📁 Servidores',
                    value: client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: '👥 Usuários',
                    value: client.users.cache.size.toString(),
                    inline: true
                },
                {
                    name: '📚 Comandos',
                    value: client.application.commands.cache.size.toString(),
                    inline: true
                }
            )
            .setFooter({
                text: `ID: ${client.user?.id}`,
                iconURL: client.user?.displayAvatarURL() || ''
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] })
    }
}