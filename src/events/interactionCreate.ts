import botStatus from "../utils/botStatus.js";
import { EmbedBuilder, Interaction } from "discord.js";
import { enviarEmbedWebhook } from "../utils/webhookLogger.js";
import { ExtendedClient } from "../types/index.js";

export default{
    name: "interactionCreate",

    async execute(interaction: Interaction){
        const client = interaction.client as ExtendedClient;

        console.log('🔍 Interação recebida de', interaction.user.tag);
        if (!interaction.isCommand()) return;
        
        const command = client.commands.get(interaction.commandName);
        const user = interaction.user;
        const guild = interaction.guild;
        
        console.log('Comandos disponíveis:', [...client.commands.keys()]);
        console.log('Comando solicitado:', interaction.commandName);
        
        
        if (!command) return;
        
        if (botStatus.isInMaintenance() && interaction.commandName !== 'manutencao') {
            return await interaction.reply({
                content: '⚠️ O bot está em manutenção no momento. Tente novamente mais tarde.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
        .setTitle('📥 Comando Utilizado')
        .setDescription('Registro de uso de comando')
        .setColor('#3498db')
        .addFields(
            { name: 'Usuário', value: `${user.tag} (\`${user.id}\`)`, inline: true },
            { name: 'Comando', value: `/${interaction.commandName}`, inline: true },
            { name: 'Servidor', value: `${guild?.name ?? 'DM'} (\`${guild?.id ?? 'N/A'}\`)`, inline: false },
        ).setTimestamp();

        try {
            console.log(`⚡ Comando recebido: ${interaction.commandName} por ${interaction.user.tag}`);
            await command.execute(interaction);

            // Send log to webhook
            enviarEmbedWebhook(embed).catch(console.error);
        } catch (error) {
            console.error(`❌ Erro no comando ${interaction.commandName}:`, error);

            if(!interaction.replied){
                try {
                    await interaction.reply({ content: 'Erro ao executar o comando!', ephemeral: true });
                } catch (e) {
                    console.error('Erro ao enviar mensagem de erro:', e);
                }
            }
        }
    }
};