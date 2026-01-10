import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export default async function eventHandler(client: any){
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    try {
        // Load Events
        const eventsPath = path.join(__dirname, '..', 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
        console.log(`🗂️  Eventos encontrados: ${eventFiles.join(', ')}`);

        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                console.log(`📥 Importando evento: ${filePath}`);
                const event = await import(pathToFileURL(filePath).href);

                if (event.default && event.default.name && event.default.execute) {
                    if (event.default.once) {
                        client.once(event.default.name, (...args: any[]) => {
                        console.log(`▶️ Evento '${event.default.name}' executado (once).`);
                        event.default.execute(...args);
                        });
                    } else {
                        client.on(event.default.name, (...args: any[]) => {
                        console.log(`▶️ Evento '${event.default.name}' executado.`);
                        event.default.execute(...args);
                        });
                    }
                    console.log(`✅ Evento "${event.default.name}" registrado!`);
                } else {
                    console.warn(`[WARN] Evento inválido ou mal formatado: ${file}`);
                    continue;
                }
            } catch (eventErr) {
                console.error(`[ERRO] Falha ao importar evento ${file}:`, eventErr);
            }
        }
    } catch (err) {
        console.error('[ERRO] Falha ao carregar eventos:', err);
    }
}