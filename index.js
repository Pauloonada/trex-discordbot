console.log("Iniciando index.js...");

import { config } from 'dotenv';
import { enviarLogWebhook } from './utils/webhookLogger.js';
import botStatus from './utils/botStatus.js';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import path from 'path';
import * as fs from 'fs';
import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';

config();

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("📦 Variáveis de ambiente visíveis:", process.env);

app.get('/', (req, res) => {
  res.send('Bot Trex está online 🚀');
});

app.listen(PORT, () => {
  console.log(`🌐 Webserver de monitoramento ativo na porta ${PORT}`);
});

async function main() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates
    ]
  });

  client.on('debug', console.log);
  client.on('warn', console.warn);
  client.on('error', console.error);

  client.commands = new Collection();
  try {
    // Load Commands
    const commandsPath = path.join(__dirname, "commands");
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
      console.log(`📂 Pasta "${folder}" tem comandos: ${commandFiles.join(', ')}`);

      for (const file of commandFiles) {
        try {
          const filePath = path.join(folderPath, file);
          const command = await import(pathToFileURL(filePath));

          if (command?.default?.data && command?.default?.execute) {
            client.commands.set(command.default.data.name, command.default);
          } else {
            console.warn(`[WARN] Comando mal formatado em: ${filePath}`);
          }
        } catch (cmdError) {
          console.error(`[ERRO] Falha ao importar comando ${file}:`, cmdError);
        }
      }
    }
  } catch (error) {
    console.error('[ERROR] Falha ao carregar comandos:', error);
  }

  // Events
  try {
    // Load Events
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    console.log(`🗂️  Eventos encontrados: ${eventFiles.join(', ')}`);

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        console.log(`📥 Importando evento: ${filePath}`);
        const event = await import(pathToFileURL(filePath));

        if (event.default && event.default.name && event.default.execute) {
          if (event.default.once) {
            client.once(event.default.name, (...args) => {
              console.log(`▶️ Evento '${event.default.name}' executado (once).`);
              event.default.execute(...args, client);
            });
          } else {
            client.on(event.default.name, (...args) => {
              console.log(`▶️ Evento '${event.default.name}' executado.`);
              event.default.execute(...args, client);
            });
          }
          console.log(`✅ Evento "${event.default.name}" registrado!`);
        } else {
          console.warn(`[WARN] Evento mal formatado: ${file}`);
          continue;
        }
      } catch (eventErr) {
        console.error(`[ERRO] Falha ao importar evento ${file}:`, eventErr);
      }
    }
  } catch (err) {
    console.error('[ERRO] Falha ao carregar eventos:', err);
  }

  // Ready
  client.once('ready', async() => {
    console.log(`🤖 Bot online como ${client.user.tag}`);
    await enviarLogWebhook(`🟢 Bot **ligado** como \`${client.user.tag}\``);
  });

  // Once SlashCommand is used
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (botStatus.isMaintenance() && interaction.commandName !== 'manutencao') {
      return await interaction.reply({
        content: '⚠️ O bot está em manutenção no momento. Tente novamente mais tarde.',
        flags: 'Ephemeral'
      });
    }

    try {
      console.log(`⚡ Comando recebido: ${interaction.commandName} por ${interaction.user.tag}`);
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Erro no comando ${interaction.commandName}:`, error);
      try {
        await interaction.reply({ content: 'Erro ao executar o comando!', flags: 'Ephemeral' });
      } catch (e) {
        console.error('Erro ao enviar mensagem de erro:', e);
      }
    }
  });

  console.log("🔎 DISCORD_TOKEN (parcial):", process.env.DISCORD_TOKEN?.slice(0, 10));
  if (!process.env.DISCORD_TOKEN) {
    console.error("❌ ERRO: Variável DISCORD_TOKEN não está definida!");
    process.exit(1);
  }

  // Mensagens WebHook
  process.on('SIGINT', async () => {
    await enviarLogWebhook('🔴 Bot **desligado manualmente** (SIGINT)');
    process.exit();
  });

  process.on('SIGTERM', async () => {
      await enviarLogWebhook('⚙️ O bot foi reiniciado por manutenção ou atualização.');
      process.exit();
  });

  process.on('uncaughtException', async (err) => {
    await enviarLogWebhook(`💥 Bot **crashou**!\nErro: \`\`\`${err.stack}\`\`\``);
    process.exit(1);
  });

  // Login
  try {
    console.log("🔐 Tentando logar com o bot...");
    await client.login(process.env.DISCORD_TOKEN);
    console.log("✅ Login executado com sucesso!");
  } catch (loginError) {
    console.error('❌ Erro no login do bot:', loginError);
  }
}

main();