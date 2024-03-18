const dayjs = require('dayjs');
const libre = require('./libre');
const nightscout = require('./nightscout');
const config = require('./config');

const sync = async function (config, { startDate, libreResetDevice }) {
  // Save config now in case of a failure to facilitate an easy retry.
  config.write(config);

  const fromDate = dayjs(startDate).format('YYYY-MM-DD');
  const toDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

  console.log('transfer time span', fromDate.gray, toDate.gray);

  const glucoseEntries = await nightscout.getNightscoutGlucoseEntries(
    config.nightscoutUrl,
    config.nightscoutToken,
    fromDate,
    toDate
  );
  const foodEntries = await nightscout.getNightscoutFoodEntries(
    config.nightscoutUrl,
    config.nightscoutToken,
    fromDate,
    toDate
  );
  const insulinEntries = await nightscout.getNightscoutInsulinEntries(
    config.nightscoutUrl,
    config.nightscoutToken,
    fromDate,
    toDate
  );
  const lastSyncTimestamp = glucoseEntries[0].timestamp;

  if (
    glucoseEntries.length > 0 ||
    foodEntries.length > 0 ||
    insulinEntries.length > 0
  ) {
    const auth = await libre.authLibreView(
      config.libreUsername,
      config.librePassword,
      config.libreDevice,
      libreResetDevice
    );
    if (!!!auth) {
      console.log('libre auth failed!'.red);

      return;
    }

    // await libre.transferLibreView(
    //   config.libreDevice,
    //   config.libreModelName,
    //   auth,
    //   glucoseEntries,
    //   foodEntries,
    //   insulinEntries
    // );

    // Re-save config to include last sync timestamp following a successful sync.
    config.write({ ...config, lastSyncTimestamp });
  }
};

module.exports = sync;
