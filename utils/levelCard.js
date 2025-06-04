import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { AttachmentBuilder } from 'discord.js';

// (Opcional) Registra uma fonte personalizada
registerFont(path.resolve('./assets/fonts/Chelsea_Market/ChelseaMarket-Regular.ttf'), { family: 'Chelsea-Market' });

export async function gerarImagemNivel(user, level, xp, voiceTime) {
    try{
        const canvas = createCanvas(800, 250);
        const ctx = canvas.getContext('2d');

        // Fundo
        ctx.fillStyle = '#1e1e2f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Avatar do usuário
        let avatar;

        try {
            const avatarURL = user.displayAvatarURL({ extension: 'jpg', size: 128 });
            avatar = await loadImage(avatarURL);
        } catch (error) {
            console.warn('⚠️ Falha ao carregar avatar, usando imagem padrão.');
            avatar = await loadImage('https://i.imgur.com/AfFp7pu.png');
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, 25, 200, 200);
        ctx.restore();

        // Nome do usuário
        ctx.font = '28px Chelsea-Market';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(user.username, 250, 70);

        // Nível e XP
        ctx.font = '22px Chelsea-Market';
        ctx.fillText(`🆙 Nível: ${level}`, 250, 120);
        ctx.fillText(`🧪 XP: ${xp}`, 250, 160);
        ctx.fillText(`🕒 Call: ${voiceTime}`, 250, 200);

        console.log('✅ Imagem de nível gerada com sucesso');

        // Retorna como attachment do Discord
        return new AttachmentBuilder(canvas.toBuffer(), { name: 'nivel.png' });
    }

    catch(erro){
        console.error("Error na geração da imagem:", erro);
        return null;
    }
}
