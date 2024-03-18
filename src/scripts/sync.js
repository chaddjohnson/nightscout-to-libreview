const config = require('../lib/config');
const sync = require('../lib/sync');

(async () => {
  await sync(config.read());
})();
