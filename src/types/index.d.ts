import { CommandInteraction, Client, Collection, ClientOptions } from "discord.js";

export interface BotCommand{
    data:{
        name: string;
        description?: string;
        options?: any[]; // Define the type of options if needed
        cooldown?: number; // Coolddown in seconds
        category?: string;
        permissions?: string[];
        aliases?: string[];
        hidden?: boolean;
        toJSON: () => any;
    };
    execute(interaction: CommandInteraction): Promise<void> | void;
};

export class ExtendedClient extends Client{
    public commands: Collection<string, BotCommand>;

    constructor(options: ClientOptions){
        super(options);
        this.commands = new Collection<string, BotCommand>();
    }
};

export type MemeApiResponse = {
    postLink: string;
    subreddit: string;
    title: string;
    url: string;
    nsfw: boolean;
    ups: number;
};