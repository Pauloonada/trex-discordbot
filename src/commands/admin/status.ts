import { ChatInputCommandInteraction, SlashCommandBuilder, PresenceUpdateStatus, ActivityType, MessageFlags } from "discord.js";

const owner = process.env.OWNER;

export default{
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Altera o status do bot')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('Tipo de atividade')
                .addChoices(
                    { name: 'Jogando', value: 'PLAYING' },
                    { name: 'Assistindo', value: 'WATCHING' },
                    { name: 'Ouvindo', value: 'LISTENING' },
                    { name: 'Transmitindo', value: 'STREAMING' }
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('mensagem')
                .setDescription('Mensagem de Status')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('disponibilidade')
                .setDescription('Disponibilidade do bot')
                .addChoices(
                    { name: 'Online 🟢', value: 'online' },
                    { name: 'Ausente 🟡', value: 'idle' },
                    { name: 'Ocupado 🔴', value: 'dnd' }
                )
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction){
        if(interaction.user.id !== owner){
            return await interaction.reply({
                content: '❌ Você não tem permissão para usar este comando.',
                flags: MessageFlags.Ephemeral
            })
        }

        const type = interaction.options.getString('tipo', true);
        const message = interaction.options.getString('mensagem', true);
        const availability = interaction.options.getString('disponibilidade', true) as PresenceUpdateStatus | null;

        const statusMap = {
            PLAYING: ActivityType.Playing,
            WATCHING: ActivityType.Watching,
            LISTENING: ActivityType.Listening,
            STREAMING: ActivityType.Streaming
        };

        // Only allow valid PresenceStatusData values: 'online', 'idle', 'dnd'
        const validStatus = (availability === 'online' || availability === 'idle' || availability === 'dnd') ? availability : 'online';

        interaction.client.user?.setPresence({
            status: validStatus,
            activities: [
                {
                    name: message,
                    type: statusMap[type as keyof typeof statusMap] || ActivityType.Playing,
                    ...(type === 'STREAMING' ? { url: 'https://www.twitch.tv/placeholder' } : {}) // Add URL for streaming type
                }
            ]
            
        });

        await interaction.reply({
            content: `✅ Status atualizado para: **${message}** como **${type}** e disponibilidade **${validStatus}**.`,
            flags: MessageFlags.Ephemeral
        })
    }
}