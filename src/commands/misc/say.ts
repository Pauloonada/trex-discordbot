import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default{
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Faz o bot falar algo')
        .addStringOption(option =>
            option
                .setName('fala')
                .setDescription('O que o bot deve dizer')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction){
        const message = interaction.options.getString('fala', true);

        await interaction.reply({ content: message, });
    }
}