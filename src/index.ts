console.log("Iniciando pacote principal...");

import { config } from 'dotenv';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import client from './client.js';
import commandHandler from './handlers/commandHandler.js';
import eventHandler from './handlers/eventHandler.js';

import { enviarLogWebhook } from './utils/webhookLogger.js';

config();

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// console.log("📦 Variáveis de ambiente visíveis:", process.env); <-- DEBUG

async function main() {
  // Carregando comandos e eventos
  await commandHandler(client);
  await eventHandler(client);

  console.log("🔐 Tentando logar com o bot...");

  console.log("🔎 DISCORD_TOKEN (parcial):", process.env.DISCORD_TOKEN?.slice(0, 10));
  if(!process.env.DISCORD_TOKEN){
    console.error("❌ ERRO: DISCORD_TOKEN não definido!");
    process.exit(1);
  }

  try{
    await client.login(process.env.DISCORD_TOKEN);
    console.log("✅ Login executado com sucesso!");

    const router = (await import('./routes/index.js')).default(client);

    app.use('/', router);
    app.listen(PORT, () => {
      console.log(`🌐 Webserver de monitoramento ativo na porta ${PORT}`);
    });
  } catch(loginError){
    console.error('❌ Erro no login do bot:', loginError);
    process.exit(1);
  }

  // Mensagens WebHook
  process.on('SIGINT', async () => {
    await enviarLogWebhook('🔴 Bot **desligado manualmente** (SIGINT)');
    process.exit();
  });

  process.on('SIGTERM', async () => {
      await enviarLogWebhook('⚙️ Bot reiniciado por manutenção ou atualização.');
      process.exit();
  });

  process.on('uncaughtException', async (err) => {
    await enviarLogWebhook(`💥 Bot **crashou**!\nErro: \`\`\`${err.stack}\`\`\``);
    process.exit(1);
  });
}

main();