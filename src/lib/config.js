const fs = require('fs');

const CONFIG_NAME = 'config.json';
const DEFAULT_CONFIG = {};

if (!fs.existsSync(CONFIG_NAME)) {
  fs.writeFileSync(CONFIG_NAME, JSON.stringify(DEFAULT_CONFIG));
}

const read = function () {
  const rawConfig = fs.readFileSync(CONFIG_NAME);
  const config = JSON.parse(rawConfig);

  return config;
};

const get = function (key) {
  const config = read();
  return config[key];
};

const write = function (config) {
  fs.writeFileSync(CONFIG_NAME, JSON.stringify(config));
};

exports.get = get;
exports.read = read;
exports.write = write;
