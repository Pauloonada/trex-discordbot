import { Events, GuildMember, TextChannel } from "discord.js";
import db from "../db.js";

export default{
    name: Events.GuildMemberRemove,
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

            const goodbyeMessage = `${member.user} não aguentou a pressão!! 🥵`;
            await channel.send({ content: goodbyeMessage });
        }

        catch(error){
            console.error("Erro ao buscar canal de boas-vindas:", error);
            return;
        }
    }
}