import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import { MemeApiResponse } from "../../types";

export default {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Mostra um meme aleatório do Reddit (via meme-api.com)"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const response = await fetch("https://meme-api.com/gimme/MemesBR");
      const meme = await response.json() as MemeApiResponse;


      if (!meme || !meme.url || meme.nsfw) {
        throw new Error("Meme inválido recebido.");
      }

      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setURL(meme.postLink)
        .setImage(meme.url)
        .setColor("#ff4500")
        .setFooter({ text: `👍 ${meme.ups} | r/${meme.subreddit}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao buscar meme:", error);
      await interaction.editReply({
        content: "❌ Não consegui buscar um meme agora. Tente novamente mais tarde!",
      });
    }
  },
};
