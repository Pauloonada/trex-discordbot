import { Events, GuildMember } from "discord.js";
import { sendGoodbye } from "../services/goodbyeService.js";

export default{
    name: Events.GuildMemberRemove,

    async execute(member: GuildMember){
        await sendGoodbye(member.guild, member.user);
    }
};