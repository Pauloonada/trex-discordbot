import { Events, GuildMember } from "discord.js";
import { sendWelcome } from "../services/welcomeService.js";

export default{
    name: Events.GuildMemberAdd,

    async execute(member: GuildMember){
        await sendWelcome(member.guild, member.user);
    }
};