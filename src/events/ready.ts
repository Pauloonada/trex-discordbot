import { enviarLogWebhook } from "../utils/webhookLogger.js";
import db from "../db.js";
import { ActivityType } from "discord.js";

import type { ExtendedClient } from "../types";

export default{
    name: "ready",
    once: true,
    async execute(client: ExtendedClient){
        console.log(`🤖 Bot online como ${client.user?.username}`);

        for (const [guildId, guild] of client.guilds.cache) {
            await db.query(
                'INSERT INTO guilds (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
                [guildId, guild.name]
            );
        }

        console.log('✅ Todas as guilds foram sincronizadas com o banco.');

        client.user?.setActivity({
            name: 'Caçando Luíses-do-mato!',
            type: ActivityType.Custom,
        });

        await enviarLogWebhook(`🟢 Bot **ligado** como \`${client.user?.username}\``);
    },
};