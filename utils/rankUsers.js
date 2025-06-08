import db from "../db.js";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from 'path';
import { AttachmentBuilder } from "discord.js";

registerFont(path.resolve('./assets/fonts/Chelsea_Market/ChelseaMarket-Regular.ttf'), {
  family: 'Chelsea-Market'
});

export default async function getRankingImage(guild){
    try{
        const res = await db.query(`
            SELECT * FROM users WHERE guild_id = $1
            ORDER BY level DESC, xp DESC LIMIT 5`,

            [guild.id]
        );

        const users = res.rows;

        const canvas = new createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // BackGround
        ctx.fillStyle = "#1e1e2f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.font = '40px Chelsea-Market';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🏆 Ranking do Servidor', 40, 50);

        const places = ['🥇', '🥈', '🥉', '4º', '5º'];

        // Rendering top 5
        for(let i = 0; i< users.length; i++){
            const user = users[i];
            const userDiscord = await guild.members.fetch(user.user_id).catch(() => null);

            const username = userDiscord?.user?.displayName ?? 'Randola?';
            const avatarURL = userDiscord?.user?.displayAvatarURL({ extension: 'png', size: 128 }) ?? 'https://i.imgur.com/AfFp7pu.png';
            const avatar = await loadImage(avatarURL);
            const topY = 100 + i * 100;

            // Round avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(80, topY + 40, 40, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 40, topY, 80, 80);
            ctx.restore();

            // Medal or position
            ctx.font = '30px Chelsea-Market';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(places[i], 140, topY + 50);

            // Name
            ctx.font = '28px Chelsea-Market';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(username, 190, topY + 35);

            // Level
            ctx.font = '22px Chelsea-Market';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`Nível ${user.level} • XP ${user.xp}`, 190, topY + 65);
        }

        return new AttachmentBuilder(canvas.toBuffer(), { name: 'ranking.png' });
    }

    catch(error){
        console.error('Erro ao gerar imagem do ranking: ', error);
        return null;
    }
}