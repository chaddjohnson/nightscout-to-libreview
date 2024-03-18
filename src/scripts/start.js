const dayjs = require('dayjs');
const uuid = require('uuid');
const colors = require('colors');
const prompt = require('prompt');
const config = require('../lib/config');
const sync = require('../lib/sync');

require('dotenv').config({ path: __dirname + '/../config.env' });

prompt.get(
  [
    {
      name: 'nightscoutUrl',
      description: 'please enter your nightscout url',
      required: true,
      default: config.get('nightscoutUrl')
    },
    {
      name: 'nightscoutToken',
      description: 'please enter your nightscout token',
      required: false,
      default: config.get('nightscoutToken')
    },
    {
      name: 'libreUsername',
      description: 'please enter your libreview username',
      required: true,
      default: config.get('libreUsername')
    },
    {
      name: 'librePassword',
      description: 'please enter your libreview password',
      required: true,
      default: config.get('librePassword')
    },
    {
      name: 'libreModelName',
      description: 'please enter your Libre model name',
      required: false,
      default: config.get('libreModelName') || 'com.abbott.librelink.de'
    },
    {
      name: 'startDate',
      description:
        'please enter the date in YYYY-MM-DD format from which you want to transfer to libreview',
      required: true,
      default: dayjs().subtract(1, 'month').format('YYYY-MM-DD')
    },
    {
      name: 'libreResetDevice',
      description:
        'if you have problems with your transfer, recreate your device id',
      required: true,
      type: 'boolean',
      default: false
    }
  ],
  async function (err, result) {
    if (err) {
      return onErr(err);
    }

    const { startDate, libreResetDevice } = result;

    syncConfig = Object.assign({}, config, {
      nightscoutUrl: result.nightscoutUrl,
      nightscoutToken: result.nightscoutToken,
      libreUsername: result.libreUsername,
      librePassword: result.librePassword,
      libreModelName: result.libreModelName,
      libreDevice:
        result.libreResetDevice || !!!config.get('libreDevice')
          ? uuid.v4().toUpperCase()
          : config.get('libreDevice'),
      lastSyncTimestamp: config.get('lastSyncTimestamp') || startDate
    });

    await sync(syncConfig, { libreResetDevice });
  }
);

function onErr(err) {
  console.log(err);
  return 1;
}
