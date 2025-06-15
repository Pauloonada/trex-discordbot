import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import getRankingImage from '../../utils/rankUsers.js';

export default{
    data: new SlashCommandBuilder().setName("rank").setDescription("Veja o rank com os 5 mais fodas do servidor"),
    async execute(interaction){
        await interaction.deferReply();

        try{
            const image = await getRankingImage(interaction.guild);

            if(!image){
                return interaction.editReply('❌ Não foi possível gerar o ranking.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🏆 Top 5 mais fodões do servidor')
                .setDescription('Veja quem são os mais viciados (em crack) daqui 💔')
                .setColor("#1e1e2f")
                .setThumbnail(interaction.guild.iconURL({ size: 128 }))
                .setImage('attachment://ranking.png');
            
            await interaction.editReply({ embeds: [embed], files: [image] });
        }

        catch(error){
            console.error('Erro no comando /rank: ', error);
            await interaction.editReply('❌ Erro ao exibir o ranking.');
        }
    },
};