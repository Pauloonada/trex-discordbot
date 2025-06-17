import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../../types";

export default{
    data: new SlashCommandBuilder()
        .setName('ajuda')
        .setDescription('Mostra a lista de comandos disponíveis do bot.'),

    async execute(interaction: ChatInputCommandInteraction){
        const commands = (interaction.client as ExtendedClient).commands;

        const embed = new EmbedBuilder()
            .setTitle('📖 Lista de Comandos')
            .setDescription('Veja abaixo a lista de comandos disponíveis:')
            .setColor('#0b1693')
            .setFooter({ text: `Total de comandos: ${commands.size}` });
        
        commands.forEach(command =>{
            embed.addFields({
                name: command.data.name,
                value: command.data.description || 'Sem descrição',
                inline: true
            });
        });

        await interaction.reply({ embeds: [embed] });
    }
};