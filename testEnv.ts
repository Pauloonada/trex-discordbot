import { config } from "dotenv";

config();

console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN);
console.log('APP_ID:', process.env.APP_ID);
console.log('WEBHOOK_LOG:', process.env.WEBHOOK_LOG);