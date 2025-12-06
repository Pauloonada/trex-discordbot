import { enviarLogWebhook } from "../utils/webhookLogger.js";
import db from "../db.js";
import { Guild } from "discord.js";

export default{
    name: "guildCreate",

    async execute(guild: Guild){
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
    }
};