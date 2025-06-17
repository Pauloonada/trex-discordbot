import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const responses = [
    'Sim, definitivamente.',
    'Claro que não.',
    'Talvez, depende do dia.',
    'Com certeza!',
    'Não, isso é impossível.',
    'Pergunte novamente mais tarde.',
    'Não Conte com isso.',
    'Minhas fontes dizem que sim.',
    'Muito duvidoso...',
    'É possível...',
    'Melhor não te dizer agora.',
    'Os astros dizem que sim.',
    'A resposta está dentro de você.',
    'Sim... quer dizer, talvez... eu não sei.',
    'Você já sabe a resposta. 😉'
]

export default{
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Pergunte algo e receba uma resposta enigmática!')
        .addStringOption(option =>
            option
                .setName('pergunta')
                .setDescription('A pergunta que você quer fazer')
                .setRequired(true)
        ),
    
    async execute(interaction: ChatInputCommandInteraction){
        const question = interaction.options.getString('pergunta', true);
        const response = responses[Math.floor(Math.random() * responses.length)]

        await interaction.reply({
            content: `🎱 **Pergunta:** ${question}\n💬 **Resposta:** ${response}`,
        });
    }
};
