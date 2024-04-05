const config = require('../lib/config');
const sync = require('../lib/sync');

(async () => {
  const libreResetDevice = !config.libreDevice;

  await sync(config.read(), { libreResetDevice });
})();
