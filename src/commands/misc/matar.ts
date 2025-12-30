import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const frases = [
    "{author} deu hit kill em {target} 💥",
    "{author} apagou {target} da existência 😱",
    "{author} estripou a família inteira de {target}, junto com ele 💀",
    "{author} estuprou {target} até a morte 👁️",
    "{author} envenenou {target} que morreu lentamente 🧪",
    "{author} jogou {target} de um penhasco 🏞️",
    "{author} atirou em {target} sem piedade 🔫",
    "{author} explodiu {target} com uma granada 💣",
    "{author} esmagou {target} com um caminhão 🚛",
    "{author} congelou {target} até a morte ❄️",
    "{author} eletrocutou {target} até parar o coração ⚡",
];

function randomPhrase(author: string, target: string){
    const frase = frases[Math.floor(Math.random() * frases.length)];
    return frase.replace("{author}", author).replace("{targer}", target);
}

export default{
    data: new SlashCommandBuilder()
        .setName("matar")
        .setDescription("Mata o usuário selecionado.")
        .addUserOption(option =>
            option
                .setName("usuário")
                .setDescription("Usuário a ser morto")
                .setRequired(true)
        )
        .setNSFW(true),

    async execute(interaction: ChatInputCommandInteraction){
        const target = interaction.options.getUser("usuário", true);

        if(target.id === interaction.user.id){
            return interaction.reply({
                content: `${interaction.user}, se suicidou... Sério? 😭`
            });
        }

        const mensagem = randomPhrase(interaction.user.toString(), target.toString());

        await interaction.reply({ content: mensagem });
    }
}