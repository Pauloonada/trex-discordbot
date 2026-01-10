import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { sendGoodbye } from "../../services/goodbyeService.js";

export default{
    data: new SlashCommandBuilder()
        .setName("testgoodbye")
        .setDescription("envia uma mensagem de despedida de teste para o canal configurado")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction: ChatInputCommandInteraction){
        await sendGoodbye(interaction.guild!, interaction.user);
        await interaction.reply({ content: '✅ Mensagem de despedidas enviada com sucesso!', flags: MessageFlags.Ephemeral });
    }
}