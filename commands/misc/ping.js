import { SlashCommandBuilder } from "discord.js";

export default{
    data: new SlashCommandBuilder().setName("ping").setDescription("Faz algo muito especial!"),
    async execute(interaction){
        await interaction.reply("🏓 Pong!");
    },
};