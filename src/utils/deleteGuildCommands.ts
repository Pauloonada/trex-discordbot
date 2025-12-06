import { config } from "dotenv";
import { REST, Routes } from "discord.js";

config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try{
        if(process.env.APP_ID && process.env.GUILD_ID){
            // Limpando os comandos de servidor
            await rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID), { body: [] });
            console.log("✅ Comandos de guilda removidos.");
        }
    } catch(error){
        console.error("❌ Erro ao limpar comandos de guild:", error);
    }
})();