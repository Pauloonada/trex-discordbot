import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType, MessageFlags } from "discord.js";
import db from "../../db.js";

export default{
    data: new SlashCommandBuilder()
    .setName("setgoodbye")
    .setDescription("define o canal de mensagens de despedidas")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
        option.setName("canal")
        .setDescription("Canal onde as mensagens de despedidas serão enviadas")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

    async execute(interaction: ChatInputCommandInteraction){
        const channel = interaction.options.getChannel("canal", true);

        await db.query(`
            INSERT INTO guilds(id, name, goodbye_channel_id)
            VALUES ($1, $2, $3)
            ON CONFLICT(id) DO UPDATE SET goodbye_channel_id = $3
        `, [interaction.guild?.id, interaction.guild?.name, channel.id]);

        await interaction.reply({ content: `Canal de despedidas definido para <#${channel.id}>`, flags: MessageFlags.Ephemeral });
    }
}