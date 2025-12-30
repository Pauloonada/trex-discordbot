import { Events, GuildMember, TextChannel } from "discord.js";
import db from "../db.js";

export default{
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember){
        try{
            const res = await db.query(
                "SELECT welcome_channel_id FROM guilds WHERE id = $1",
                [member.guild.id]
            );

            const channelID = res.rows[0]?.welcome_channel_id;
            if(!channelID) return;

            const channel = member.guild.channels.cache.get(channelID) as TextChannel;
            if(!channel) return;

            const welcomeMessage = `Bem vindo(a), ${member.user}! 🎉 Só lembre de tomar cuidado com o Luís!!`;
            await channel.send({ content: welcomeMessage });
        }

        catch(error){
            console.error("Erro ao buscar canal de boas-vindas:", error);
            return;
        }
    }
}