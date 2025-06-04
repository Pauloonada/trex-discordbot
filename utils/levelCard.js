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

        // Carregar ícones
        const iconNivel = await loadImage('./assets/icons/level-up.png');
        const iconXP = await loadImage('./assets/icons/experience.png');
        const iconCall = await loadImage('./assets/icons/clock.png');

        // Ícone + texto: Nível
        ctx.drawImage(iconNivel, 250, 95, 24, 24); // (x, y, largura, altura)
        ctx.fillText(`Nível: ${level}`, 280, 115);

        // Ícone + texto: XP
        ctx.drawImage(iconXP, 250, 135, 24, 24);
        ctx.fillText(`XP: ${xp}`, 280, 155);

        // Ícone + texto: Tempo em call
        ctx.drawImage(iconCall, 250, 175, 24, 24);
        ctx.fillText(`Call: ${voiceTime}`, 280, 195);


        // Barra de progresso de XP
        const xpAtual = xp;
        const xpProximoNivel = 5 * (level ** 2) + 50 * level + 100;
        const progresso = Math.min(xpAtual / xpProximoNivel, 1);

        // Estilo da barra
        const barX = 250;
        const barY = 220;
        const barWidth = 500;
        const barHeight = 20;

        // Fundo da barra (cinza escuro)
        ctx.fillStyle = '#3a3a4f';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Barra preenchida (gradiente azul-esverdeado)
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#00ffc8');
        gradient.addColorStop(1, '#0077ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * progresso, barHeight);

        // Texto em cima da barra
        ctx.font = '18px Chelsea-Market';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${xpAtual} / ${xpProximoNivel} XP`, barX + 180, barY + 15);

        console.log('✅ Imagem de nível gerada com sucesso');

        // Retorna como attachment do Discord
        return new AttachmentBuilder(canvas.toBuffer(), { name: 'nivel.png' });
    }

    catch(erro){
        console.error("Error na geração da imagem:", erro);
        return null;
    }
}
