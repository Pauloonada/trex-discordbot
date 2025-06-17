import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, TextChannel, MessageFlags } from "discord.js";
import { sendSuggestionWebhook } from "../../utils/webhookSuggestions.js";

export default{
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Envie uma sugestão para o bot')
        .addStringOption(option => 
            option
                .setName('sugestão')
                .setDescription('O conteúdo da sua sugestão')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction){
        const suggestion = interaction.options.getString('sugestão', true);
        const user = interaction.user;

        const suggestionChannel = interaction.guild?.channels.cache.find(
            channel => channel.name === 'sugestões' && channel.isTextBased() && channel.isThread() === false
        ) as TextChannel || undefined;

        if(!suggestionChannel){
            return await interaction.reply({
                content: '❌ Canal de sugestões não encontrado!',
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('📬 Nova Sugestão')
            .setDescription(suggestion)
            .setColor('#00b0f4')
            .setFooter({
                text: `Sugestão de ${user.tag}`,
                iconURL: user.displayAvatarURL()
            })
            .setTimestamp();

        await sendSuggestionWebhook(embed);

        const suggestionMessage = await suggestionChannel.send({ embeds: [embed] });
        await suggestionMessage.react('✅');
        await suggestionMessage.react('❌');

        await interaction.reply({
            content: '✅ Sua sugestão foi enviada com sucesso!',
            flags: MessageFlags.Ephemeral
        });
    }
};