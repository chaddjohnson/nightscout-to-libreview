const dayjs = require('dayjs');
const uuid = require('uuid');
const libre = require('./libre');
const nightscout = require('./nightscout');
const config = require('./config');

const sync = async function (syncConfig, options = {}) {
  // Save config now in case of a failure to facilitate an easy retry.
  config.write(syncConfig);

  const { libreResetDevice = false } = options;

  const fromDate = dayjs(syncConfig.lastSyncTimestamp)
    .add(1, 'second')
    .toISOString();
  const toDate = dayjs().add(1, 'day').toISOString();

  console.log('transfer time span', fromDate.gray, toDate.gray);

  const glucoseEntries = await nightscout.getNightscoutGlucoseEntries(
    syncConfig.nightscoutUrl,
    syncConfig.nightscoutToken,
    fromDate,
    toDate
  );
  const foodEntries = await nightscout.getNightscoutFoodEntries(
    syncConfig.nightscoutUrl,
    syncConfig.nightscoutToken,
    fromDate,
    toDate
  );
  const insulinEntries = await nightscout.getNightscoutInsulinEntries(
    syncConfig.nightscoutUrl,
    syncConfig.nightscoutToken,
    fromDate,
    toDate
  );
  const lastSyncTimestamp =
    glucoseEntries[0]?.timestamp || new Date().toISOString();

  syncConfig.libreDevice = syncConfig.libreDevice || uuid.v4().toUpperCase();

  if (
    glucoseEntries.length > 0 ||
    foodEntries.length > 0 ||
    insulinEntries.length > 0
  ) {
    const auth = await libre.authLibreView(
      syncConfig.libreUsername,
      syncConfig.librePassword,
      syncConfig.libreDevice,
      libreResetDevice
    );

    if (!!!auth) {
      console.log('libre auth failed!'.red);
      return;
    }

    await libre.transferLibreView(
      syncConfig.libreDevice,
      syncConfig.libreModelName,
      auth,
      glucoseEntries,
      foodEntries,
      insulinEntries
    );

    // Re-save config to include last sync timestamp following a successful sync.
    config.write({ ...syncConfig, lastSyncTimestamp });
  }
};

module.exports = sync;
