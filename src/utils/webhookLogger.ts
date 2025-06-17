import { WebhookClient, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

const WEBHOOK_URL_NORMAL = process.env.WEBHOOK_URL_NORMAL!;
const WEBHOOK_URL_ADMIN = process.env.WEBHOOK_URL_ADMIN!;

export async function enviarLogWebhook(mensagem: string) {
    try {
        await fetch(WEBHOOK_URL_NORMAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: mensagem }),
        });
        console.log('✅ Log enviado pro webhook');
    } catch (err) {
        console.error('❌ Erro ao enviar webhook:', err);
    }
}

export async function enviarEmbedWebhook(embed: EmbedBuilder) {
     try {
        const webhookClient = new WebhookClient({ url: WEBHOOK_URL_ADMIN });

        await webhookClient.send({
            content: '🔔 Log automático',
            embeds: [embed],
        });

        console.log('✅ Embed enviado pro webhook');
    } catch (err) {
        console.error('❌ Erro ao enviar embed pro webhook:', err);
    }
}