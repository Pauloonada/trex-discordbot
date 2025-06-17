import { EmbedBuilder, WebhookClient } from "discord.js";

const WebhookURL = process.env.WEBHOOK_URL_SUGESTOES!;
const webhook = new WebhookClient({ url: WebhookURL });

export async function sendSuggestionWebhook(embed: EmbedBuilder){
    try{
        await webhook.send({ embeds: [embed] });
    }
    catch(error){
        console.error("Erro ao enviar sugestão para o webhook:", error);
    }
}