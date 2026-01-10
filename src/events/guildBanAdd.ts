import { Events, GuildBan } from "discord.js";
import { sendGoodbye } from "../services/goodbyeService.js";

export default{
    name: Events.GuildBanAdd,

    async execute(ban: GuildBan){
        console.log(`📥 Usuário banido: ${ban.user.tag}`);
        await sendGoodbye(ban.guild, ban.user);
    }
};