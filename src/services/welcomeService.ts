import { Guild, TextChannel, User } from "discord.js";
import db from "../db.js";

export async function sendWelcome(guild: Guild, user: User){
        try{
            const res = await db.query(
                "SELECT welcome_channel_id FROM guilds WHERE id = $1",
                [guild.id]
            );

            if(!res.rows.length){
                console.log(`Guild ${guild.id} sem config de boas-vindas`);
                return;
            }

            const channelID = res.rows[0]?.welcome_channel_id;
            if(!channelID){
                console.log(`Guild ${guild.id} sem config de welcome`);
                return;
            }

            const channel = await guild.channels.fetch(channelID).catch(() => null) as TextChannel;
            if(!channel || !channel.isTextBased()){
                console.log(`Canal de boas-vindas não encontrado para a guild ${guild.id}`);
                return;
            }

            const welcomeMessage = `Bem vindo(a), ${user}! 🎉 Só lembre de tomar cuidado com o Luís!!`;
            await channel.send({ content: welcomeMessage });
        }

        catch(error){
            console.error("Erro ao buscar canal de boas-vindas:", error);
            return;
        }
    }