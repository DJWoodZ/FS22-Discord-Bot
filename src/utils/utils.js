if (process.env.FS22_BOT_DISABLE_CERTIFICATE_VERIFICATION === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

const _ = require('lodash');
const convert = require('xml-js');
const fetch = require('fetch-retry')(global.fetch);

const retries = Math.max(parseInt(process.env.FS22_BOT_FETCH_RETRIES, 10), 1) || 5;
const retryDelay = Math.max(parseInt(process.env.FS22_BOT_FETCH_RETRY_DELAY_MS, 10), 1) || 2000;

const utils = {
  getDefaultDatabase: () => (_.cloneDeep({
    server: {
      game: '',
      version: '',
      name: '',
      mapName: '',
      online: false,
      unreachable: false,
    },
    mods: {},
    slots: {
      players: {},
      numUsed: 0,
      capacity: 0,
    },
    careerSavegame: {
      money: 0,
      playTime: 0,
    },
  })),

  getTimestamp: () => `<t:${Math.floor(new Date().getTime() / 1000)}>`,

  formatPlayers: (players) => {
    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
    return formatter.format(Object.keys(players)
      .sort((playerA, playerB) => playerA.toLowerCase().localeCompare(playerB.toLowerCase())));
  },

  formatMinutes: (minutes) => {
    const remainingDays = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;

    let string = '';
    if (remainingDays > 0) {
      string += `${remainingDays} day${(remainingDays !== 1 ? 's' : '')}, `;
    }
    if (remainingDays > 0 || remainingHours > 0) {
      string += `${remainingHours} hour${(remainingHours !== 1 ? 's' : '')} and `;
    }
    return `${string}${remainingMinutes} minute${(remainingMinutes !== 1 ? 's' : '')}`;
  },

  getDataFromAPI: () => Promise.all([
    fetch(process.env.FS22_BOT_URL_SERVER_STATS, {
      retries,
      retryDelay,
      body: null,
      method: 'GET',
    }),
    fetch(process.env.FS22_BOT_URL_CAREER_SAVEGAME, {
      retries,
      retryDelay,
      body: null,
      method: 'GET',
    }),
  ])
    .then(([
      serverStatsResponse,
      careerSavegameResponse,
    ]) => Promise.all([serverStatsResponse.text(), careerSavegameResponse.text()]))
    .then(([
      serverStatsXml,
      careerSavegameXml,
    ]) => ({
      serverStats: JSON.parse(convert.xml2json(serverStatsXml, { compact: true })),
      careerSavegame: JSON.parse(convert.xml2json(careerSavegameXml, { compact: true })),
    })),

  parseData: ({ serverStats, careerSavegame: savegame }, previousPlayers, previousServer) => {
    if (!serverStats || !serverStats?.Server?._attributes || !savegame) {
      return null;
    }

    const server = {
      game: serverStats.Server._attributes.game || previousServer.game,
      version: serverStats.Server._attributes.version || previousServer.version,
      name: serverStats.Server._attributes.name || previousServer.name,
      mapName: serverStats.Server._attributes.mapName || previousServer.mapName,
      online: true,
      unreachable: false,
    };

    let mods = {};
    if (serverStats.Server?.Mods?.Mod !== undefined) {
      mods = (Array.isArray(serverStats.Server.Mods.Mod)
        ? serverStats.Server.Mods.Mod : [serverStats.Server.Mods.Mod]).map((mod) => ({
        hash: mod._attributes.hash,
        text: mod._text,
        name: mod._attributes.name,
        version: mod._attributes.version,
        author: mod._attributes.author,
      }))
        .reduce((obj, item) => Object.assign(obj, { [item.hash]: item }), {});
    }

    const now = new Date().getTime();
    const playersArray = serverStats.Server.Slots.Player
      .filter((player) => Object.prototype.hasOwnProperty.call(player, '_text'))
      .map((player) => player._text)
      .sort();
    const players = playersArray.map((player) => ({
      name: player,
      firstSeen: (previousPlayers || {})[player]?.firstSeen || now,
    }))
      .reduce((obj, player) => Object.assign(obj, { [player.name]: player }), {});
    const numUsed = parseInt(serverStats.Server.Slots._attributes.numUsed, 10);
    const capacity = parseInt(serverStats.Server.Slots._attributes.capacity, 10);

    const slots = {
      numUsed,
      capacity,
      players,
    };

    const careerSavegame = {
      money: parseInt(savegame.careerSavegame.statistics.money._text || 0, 10),
      playTime: parseInt(savegame.careerSavegame.statistics.playTime._text || 0, 10),
    };

    return {
      server,
      mods,
      slots,
      careerSavegame,
    };
  },

  getModString(newData, previousMods, dlc) {
    const characterLimit = (dlc ? 300 : 1200);
    const modType = (dlc ? 'DLC' : 'mod');
    const emoji = (dlc ? ':cd:' : ':joystick:');

    const filteredNew = Object.fromEntries(Object.entries(newData.mods)
      .filter(([, { name: modName }]) => (dlc ? modName.startsWith('pdlc_') : !modName.startsWith('pdlc_'))));
    const filteredPrevious = Object.fromEntries(Object.entries(previousMods)
      .filter(([, { name: modName }]) => (dlc ? modName.startsWith('pdlc_') : !modName.startsWith('pdlc_'))));

    let string = '';

    const newMods = [];
    const updatedMods = [];
    Object.values(filteredNew)
      .sort((modA, modB) => modA.text.toLowerCase().localeCompare(modB.text.toLowerCase()))
      .forEach((mod) => {
        if (!Object.prototype.hasOwnProperty.call(filteredPrevious, mod.hash)) {
          if (Object.values(filteredPrevious).map(({ name: modName }) => modName)
            .includes(mod.name)) {
            updatedMods.push(mod);
          } else {
            newMods.push(mod);
          }
        }
      });
    const removedMods = [];
    Object.values(filteredPrevious)
      .sort((modA, modB) => modA.text.toLowerCase().localeCompare(modB.text.toLowerCase()))
      .forEach((mod) => {
        if (!Object.prototype.hasOwnProperty.call(filteredNew, mod.hash)) {
          if (!Object.values(updatedMods).map(({ name: modName }) => modName).includes(mod.name)) {
            removedMods.push(mod);
          }
        }
      });

    let tempModsString = '';
    if (newMods.length > 0) {
      tempModsString += `${emoji} The server has **${newMods.length}** new ${modType}${newMods.length !== 1 ? 's' : ''}:\n`;
      newMods.forEach(({
        hash, text, version: modVersion, author,
      }) => {
        tempModsString += `    :star2: **${text} ${modVersion}** by ${author} (\`${hash}\`)\n`;
      });
    }

    if (updatedMods.length > 0) {
      tempModsString += `${emoji} The server has **${updatedMods.length}** updated ${modType}${updatedMods.length !== 1 ? 's' : ''}:\n`;
      updatedMods.forEach(({
        hash, text, version: modVersion, author,
      }) => {
        tempModsString += `    :star: **${text} ${modVersion}** by ${author} (\`${hash}\`)\n`;
      });
    }

    if (removedMods.length > 0) {
      tempModsString += `${emoji} The server had **${removedMods.length}** ${modType}${removedMods.length !== 1 ? 's' : ''} removed:\n`;
      removedMods.forEach(({
        hash, text, version: modVersion, author,
      }) => {
        tempModsString += `    :x: **${text} ${modVersion}** by ${author} (\`${hash}\`)\n`;
      });
    }

    if (tempModsString.length > 0) {
      if (tempModsString.length <= characterLimit) {
        string += tempModsString;
      } else {
        if (newMods.length > 0) {
          string += `${emoji} The server has **${newMods.length}** new ${modType}${newMods.length !== 1 ? 's' : ''}.\n`;
        }
        if (updatedMods.length > 0) {
          string += `${emoji} The server has **${updatedMods.length}** updated ${modType}${updatedMods.length !== 1 ? 's' : ''}.\n`;
        }
        if (removedMods.length > 0) {
          string += `${emoji} The server had **${removedMods.length}** ${modType}${removedMods.length !== 1 ? 's' : ''} removed.\n`;
        }
      }
    }

    return string;
  },
};

module.exports = utils;
