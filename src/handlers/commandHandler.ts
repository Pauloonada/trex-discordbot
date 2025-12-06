import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export default async function commandHandler(client: any){
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    try {
        // Load Commands
        const commandsPath = path.join(__dirname, "..", "commands");
        const commandFolders = fs.readdirSync(commandsPath);
    
        for (const folder of commandFolders) {
          const folderPath = path.join(commandsPath, folder);
          const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
          console.log(`📂 Pasta "${folder}" tem comandos: ${commandFiles.join(', ')}`);
    
          for (const file of commandFiles) {
            try {
              const filePath = path.join(folderPath, file);
              const command = await import(pathToFileURL(filePath).href);
    
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
}