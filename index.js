import { config } from 'dotenv';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import path from 'path';
import * as fs from 'fs';
import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';

config();

const app = express();
const PORT = process.env.MONITOR_PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
  res.send('Bot Trex está online 🚀');
});

app.listen(PORT, () => {
  console.log(`🌐 Webserver de monitoramento ativo na porta ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

  for(const file of commandFiles){
    const filePath = path.join(folderPath, file);
    const command = await import(pathToFileURL(filePath));

    if(command?.default?.data && command?.default?.execute){
      client.commands.set(command.default.data.name, command.default);
    }
    
    else{
      console.warn(`[WARN] Comando mal formatado em: ${filePath}`);
    }
  }
}

// Events

// Ready
client.once('ready', () => {
  console.log(`Bot online como ${client.user.username}`);
});

// Once SlashCommand is used
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try{
    await command.execute(interaction);
  }

  catch(error){
    console.error(`❌ Erro no comando ${interaction.commandName}:`, error)
    await interaction.reply({ content: 'Erro ao executar o comando!', flags: 'Ephemeral' });
  }
});

// Load Level
const eventsPath = path.join(__dirname, 'utils');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for(const file of eventFiles){
  const filePath = path.join(eventsPath, file);
  const event = await import(pathToFileURL(filePath));

  if(event.default && event.default.name && event.default.execute){
    if(event.default.once){
      client.once(event.default.name, (...args) => event.default.execute(...args, client));
    }
    
    else{
      client.on(event.default.name, (...args) => event.default.execute(...args, client));
    }
  }
  
  else{
    console.warn(`[WARN] Evento mal formatado: ${file}`);
  }
}

// Login
client.login(process.env.DISCORD_TOKEN);
