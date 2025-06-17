import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default{
    data: new SlashCommandBuilder().setName('coinflip').setDescription('Joga cara ou coroa!'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const result = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        await interaction.reply(`🪙 ${result}!`);
    }
}