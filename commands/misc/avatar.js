import { SlashCommandBuilder } from "discord.js";

export default{
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Exibe o avatar de um usuário.')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que você quer ver o avatar')
        .setRequired(false)
    ),

  async execute(interaction){
    const user = interaction.options.getUser('usuario') || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    await interaction.reply({
      content: `🖼️ Avatar de ${user.username}:`,
      files: [avatarURL]
    });
  }
};
