const fs = require('fs');
require('dotenv-flow').config();

const dbPath = process.env.FS22_BOT_DB_PATH;

const {
  getDataFromAPI,
  parseData,
  getDefaultDatabase,
} = require('./utils/utils');

const update = () => {
  console.log('Updating ...');
  getDataFromAPI()
    .then((rawData) => {
      const data = parseData(rawData);
      if (data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Database written');
      } else {
        fs.writeFileSync(dbPath, JSON.stringify(getDefaultDatabase(), null, 2), 'utf8');
        console.log('Server appears to be offline, created default database');
      }
    })
    .catch((e) => console.error(e));
};

update();
