import { Guild, TextChannel, User } from "discord.js";
import db from "../db.js";

export async function sendGoodbye(guild: Guild, user: User){
        try{
            const res = await db.query(
                "SELECT goodbye_channel_id FROM guilds WHERE id = $1",
                [guild.id]
            );

            if(!res.rows.length){
                console.log(`Guild ${guild.id} sem config de despedidas`);
                return;
            }

            const channelID = res.rows[0]?.goodbye_channel_id;
            if(!channelID){
                console.log(`Guild ${guild.id} sem config de despedidas`);
                return;
            }

            const channel = await guild.channels.fetch(channelID).catch(() => null) as TextChannel;
            if(!channel || !channel.isTextBased()){
                console.log(`Canal de despedidas não encontrado para a guild ${guild.id}`);
                return;
            }

            const goodbyeMessage = `${user} não aguentou a pressão!! 🥵`;
            await channel.send({ content: goodbyeMessage });
        }

        catch(error){
            console.error("Erro ao buscar canal de despedidas:", error);
            return;
        }
    }