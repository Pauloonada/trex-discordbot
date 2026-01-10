import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { sendWelcome } from "../../services/welcomeService.js";

export default{
    data: new SlashCommandBuilder()
        .setName("testwelcome")
        .setDescription("envia uma mensagem de boas-vindas de teste para o canal configurado")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction: ChatInputCommandInteraction){
        await sendWelcome(interaction.guild!, interaction.user);
        await interaction.reply({ content: '✅ Mensagem de boas-vindas enviada com sucesso!', flags: MessageFlags.Ephemeral });
    }
}