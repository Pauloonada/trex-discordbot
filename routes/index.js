import express from 'express';

export default function createRouter(client) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const uptime = formatUptime(client.uptime);
    const status = client.user?.presence?.status || 'indefinido';
    const commands = client.commands?.size || 0;

    res.render('index', {
      status,
      uptime,
      commands
    });
  });

  function formatUptime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s}s`;
  }

  return router;
}
