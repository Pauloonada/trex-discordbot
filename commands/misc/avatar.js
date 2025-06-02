import { SlashCommandBuilder } from "discord.js";

export default{
    data: new SlashCommandBuilder().setName("avatar").setDescription("A ser implementado"),
    async execute(interaction){
        await interaction.reply("Ainda a ser implementado...");
    },
};