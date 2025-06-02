import levelSystem from '../utils/levelSystem.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    try {
      await levelSystem.execute(message);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }
};
