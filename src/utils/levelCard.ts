import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { AttachmentBuilder } from 'discord.js';

import type { GuildMember, Role } from 'discord.js';
import type { CanvasRenderingContext2D } from 'canvas';

registerFont(path.resolve('./assets/fonts/Chelsea_Market/ChelseaMarket-Regular.ttf'), { family: 'Chelsea-Market' });

export async function gerarImagemNivel(user: GuildMember, level: number, xp: number, voiceTime: string, cargos: Role[] | String[]): Promise<AttachmentBuilder | null> {
    try {
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
        } catch {
            avatar = await loadImage('https://i.imgur.com/AfFp7pu.png');
        }

        const ignoredRoles = ['adm', 'Administrador'];

        const coloredRoles = user.roles.cache.filter(role => role.color !== 0 && !ignoredRoles.includes(role.name));

        let borderColor = '#1e1e2f';
        if (coloredRoles.size > 0) {
            const topRole = coloredRoles.reduce((a, b) => (a.position > b.position ? a : b));
            borderColor = topRole.hexColor;
        }

        // Fancy border
        ctx.beginPath();
        ctx.arc(125, 125, 105, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Avatar
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
        ctx.fillText(user.user.username, 250, 70);

        // Carregar ícones
        const iconNivel = await loadImage('./assets/icons/level-up.png');
        const iconXP = await loadImage('./assets/icons/experience.png');
        const iconCall = await loadImage('./assets/icons/clock.png');

        // Ícone + texto: Nível
        ctx.drawImage(iconNivel, 250, 95, 24, 24);
        ctx.fillText(`Nível: ${level}`, 280, 115);

        // Ícone + texto: XP
        ctx.drawImage(iconXP, 250, 135, 24, 24);
        ctx.fillText(`XP: ${xp}`, 280, 155);

        // Ícone + texto: Tempo em call
        ctx.drawImage(iconCall, 250, 175, 24, 24);
        ctx.fillText(`Call: ${voiceTime}`, 280, 195);

        // Barra de progresso XP — sem recalcular level, usa o level que recebeu
        const xpAtualMin = 100 * level * level;
        const xpProxNivel = 100 * (level + 1) * (level + 1);
        const xpDentroDoNivel = xp - xpAtualMin;
        const xpNecessario = xpProxNivel - xpAtualMin;
        const progresso = xpDentroDoNivel / xpNecessario;

        const barX = 250;
        const barY = 220;
        const barWidth = 500;
        const barHeight = 20;

        ctx.fillStyle = '#3a3a4f';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#00ffc8');
        gradient.addColorStop(1, '#0077ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * progresso, barHeight);

        ctx.font = '18px Chelsea-Market';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${xpDentroDoNivel} / ${xpNecessario} XP`, barX + 180, barY + 15);

        // --- Desenhar cargos ---
        const cargosMostrar = cargos.slice(0, 4);
        const caixaPaddingX = 12;
        const caixaPaddingY = 6;
        const espacamento = 10;
        const fonteTamanho = 16;

        ctx.font = `${fonteTamanho}px Chelsea-Market`;

        let x = canvas.width - 20;
        let y = 10;

        for (let i = cargosMostrar.length - 1; i >= 0; i--) {
            const texto = `#${cargosMostrar[i]}`;
            const larguraTexto = ctx.measureText(texto).width;
            const caixaLargura = larguraTexto + caixaPaddingX * 2;
            const caixaAltura = fonteTamanho + caixaPaddingY * 2;

            x -= caixaLargura;

            roundRect(ctx, x, y - caixaAltura, caixaLargura, caixaAltura, 8, '#223355cc');

            ctx.fillStyle = '#ffffff';
            ctx.fillText(texto, x + caixaPaddingX, y + caixaPaddingY);

            x -= espacamento;
        }

        console.log('✅ Imagem de nível gerada com sucesso');
        return new AttachmentBuilder(canvas.toBuffer(), { name: 'nivel.png' });

    } catch (erro) {
        console.error("Erro na geração da imagem:", erro);
        return null;
    }
}

// Função auxiliar para retângulos arredondados
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillStyle: string) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
}
