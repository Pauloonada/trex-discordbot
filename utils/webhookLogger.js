import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

const WEBHOOK_URL = process.env.WEBHOOK_URL;

export async function enviarLogWebhook(mensagem) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: mensagem }),
        });
        console.log('✅ Log enviado pro webhook');
    } catch (err) {
        console.error('❌ Erro ao enviar webhook:', err);
    }
}
