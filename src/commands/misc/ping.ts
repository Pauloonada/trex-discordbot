import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default{
    data: new SlashCommandBuilder().setName("ping").setDescription("Mostra a latência do bot"),
    async execute(interaction: ChatInputCommandInteraction){
        const sentTimestamp = Date.now();
        await interaction.reply({
            content: "🏓 Pingando...",
            withResponse: true,
        });

        const ping = sentTimestamp - interaction.createdTimestamp;
        const websocketPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle("🏓 Pong!")
            .setColor("#00b0f4")
            .addFields(
                { name: 'Latência da Mensagem', value: `${ping}ms`, inline: true },
                { name: 'Latência do WebSocket', value: `${websocketPing}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({
            content: null,
            embeds: [embed],
        })
    },
};