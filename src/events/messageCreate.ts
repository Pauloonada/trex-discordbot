import levelSystem from '../utils/levelSystem.js';
import type { Message } from 'discord.js';

export default {
  name: 'messageCreate',
  async execute(message: Message): Promise<void> {
    try {
      await levelSystem.execute(message);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }
};
