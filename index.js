console.log("Iniciando index.js...");

import { config } from 'dotenv';
import { enviarLogWebhook, enviarEmbedWebhook } from './utils/webhookLogger.js';
import botStatus from './utils/botStatus.js';
import db from './db.js';
import { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } from 'discord.js';
import path from 'path';
import * as fs from 'fs';
import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';

config();

const app = express();
const PORT = process.env.PORT || 8080;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

console.log("📦 Variáveis de ambiente visíveis:", process.env);

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
    console.log(`🤖 Bot online como ${client.user.username}`);
    await enviarLogWebhook(`🟢 Bot **ligado** como \`${client.user.username}\``);

    for (const [guildId, guild] of client.guilds.cache) {
    await db.query(
      'INSERT INTO guilds (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [guildId, guild.name]
    );
  }

  console.log('✅ Todas as guilds foram sincronizadas com o banco.');

    client.user.setActivity({
      name: 'Oruam 💔',
      type: ActivityType.Listening
    });
  });

  client.on('guildCreate', async guild => {
    if (!guild.available) return;

    try {
      await db.query(
        'INSERT INTO guilds (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [guild.id, guild.name]
      );

      console.log(`🎉 Bot adicionado ao servidor: ${guild.name} (${guild.id})`);
      await enviarLogWebhook(`🟢 Bot adicionado ao servidor: **${guild.name}** (\`${guild.id}\`)`);
    } catch (err) {
      console.error('Erro ao adicionar guilda ao banco:', err);
    }
  });


  // Once SlashCommand is used
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    const user = interaction.user;
    const guild = interaction.guild;

    if (!command) return;

    if (botStatus.isMaintenance() && interaction.commandName !== 'manutencao') {
      return await interaction.reply({
        content: '⚠️ O bot está em manutenção no momento. Tente novamente mais tarde.',
        flags: 'Ephemeral'
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📥 Comando Utilizado')
      .setDescription('Registro de uso de comando')
      .setColor('#3498db')
      .addFields(
        { name: 'Usuário', value: `${user.tag} (\`${user.id}\`)`, inline: true },
        { name: 'Comando', value: `/${interaction.commandName}`, inline: true },
        { name: 'Servidor', value: `${guild?.name ?? 'DM'} (\`${guild?.id ?? 'N/A'}\`)`, inline: false },
      )
      .setTimestamp();

    try {
      console.log(`⚡ Comando recebido: ${interaction.commandName} por ${interaction.user.tag}`);
      await command.execute(interaction);

      // Send log to webhook
      enviarEmbedWebhook(embed).catch(console.error);
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
      await enviarLogWebhook('⚙️ Bot reiniciado por manutenção ou atualização.');
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

    const router = (await import('./routes/index.js')).default(client);

    app.use('/', router);
    app.listen(PORT, () => {
      console.log(`🌐 Webserver de monitoramento ativo na porta ${PORT}`);
    });
  } catch (loginError) {
    console.error('❌ Erro no login do bot:', loginError);
  }
}

main();