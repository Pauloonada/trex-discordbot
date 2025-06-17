import { config } from "dotenv";
import { REST, Routes } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import fs from 'fs';
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for(const folder of commandFolders){
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for(const file of commandFiles){
        const filePath = path.join(folderPath, file);
        const command = await import(pathToFileURL(filePath).href);

        if(command?.default?.data && command?.default?.execute){
            commands.push(command.default.data.toJSON());
        }
        
        else{
            console.warn(`[WARN] O Comando em ${filePath} está mal formatado (ou sem 'export default').`);
        }
        
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

try{
    console.log("⏳ Registrando comandos (slash)...")
    console.log("Comandos a serem registrados:");
    commands.forEach(cmd => console.log(" -", cmd.name));
    
    await rest.put(Routes.applicationCommands(process.env.APP_ID!), { body: commands });
    await rest.put(Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID!), { body: commands });

    console.log("✅ Comandos registrados com sucesso.");
} catch(error){
    console.error("❌ Erro ao registrar comandos:", error);
}
/*
if (process.env.GUILD_ID) {
  try {
    console.log("🧹 Limpando comandos antigos da GUILD...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID!),
      { body: [] } // Limpa todos os comandos de guilda
    );
    console.log("✅ Comandos de guilda limpos.");
  } catch (error) {
    console.error("❌ Erro ao limpar comandos da GUILD:", error);
  }
}
*/
console.log("✅ deployCommands.js finalizado com sucesso!");