import db from "../db.js";
import { createCanvas, loadImage, registerFont, Image } from "canvas";
import path from 'path';
import { AttachmentBuilder } from "discord.js";

registerFont(path.resolve('./assets/fonts/Chelsea_Market/ChelseaMarket-Regular.ttf'), {
  family: 'Chelsea-Market'
});

export default async function getRankingImage(guild){
    try{
        const res = await db.query(`
            SELECT * FROM user_guild_data WHERE guild_id = $1
            ORDER BY level DESC, xp DESC LIMIT 5`,

            [guild.id]
        );

        const users = res.rows;

        const canvas = new createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // BackGround
        ctx.fillStyle = "#1e1e2f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Trophy icon
        const trophyIcon = await loadImage('./assets/icons/trophy.png');
        ctx.drawImage(trophyIcon, 60, 20, 60, 60);

        // Title
        ctx.font = '40px Chelsea-Market';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Ranking do Servidor', 150, 60);

        const medalIcons = [
            await loadImage('./assets/icons/medal1.png'),
            await loadImage('./assets/icons/medal2.png'),
            await loadImage('./assets/icons/medal3.png'),
        ]

        const places = [medalIcons[0], medalIcons[1], medalIcons[2], '4º', '5º'];

        // Rendering top 5
        for(let i = 0; i< users.length; i++){
            const user = users[i];
            const userDiscord = await guild.members.fetch(user.user_id).catch(() => null);

            const username = userDiscord?.user?.displayName ?? 'Randola?';
            const avatarURL = userDiscord?.user?.displayAvatarURL({ extension: 'png', size: 128 }) ?? 'https://i.imgur.com/AfFp7pu.png';
            const avatar = await loadImage(avatarURL);
            const topY = 100 + i * 100;

            // Container-like border
            ctx.fillStyle = '#2a2a40';
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(30, topY - 10, 740, 90, 20); // (x, y, width, height, radius)
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;

            const ignoredRoles = ['adm', 'Administrador'];

            const coloredRoles = userDiscord.roles.cache.filter(role => role.color !== 0 && !ignoredRoles.includes(role.name));

            let borderColor = '#1e1e2f';
            if (coloredRoles.size > 0) {
                const topRole = coloredRoles.reduce((a, b) => (a.position > b.position ? a : b));
                borderColor = topRole.hexColor;
            }

            const centerX = 90;
            const centerY = topY + 35;
            const radius = 42;

            // Border
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 50, topY - 5, 80, 80);
            ctx.restore();

            // Medal or position
            if (places[i] instanceof Image) {
                // Draws image (medal)
                ctx.drawImage(places[i], 140, topY + 15, 50, 50);
            }
            
            else{
                // Styled text
                ctx.font = '30px Chelsea-Market';
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillText(places[i], 150, topY + 50);

                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }


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