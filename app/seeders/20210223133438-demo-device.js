'use strict';
const v4 = require('uuid').v4;

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function makeID(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function generate_devices(amount){
  let records = [];
  for (let i = 0; i < amount; i++) {

    let id = v4();
    let width = Math.random() < 0.5 ? 1080 : 1920;
    let filNr = getRndInteger(100,500);
    let filesystem_space = Math.floor(Math.random() * (1000 - 400) + 400) / 100;

    let device = {
      deviceUUID: id,
      filNr: filNr,
      location: filNr + ' - ' +makeID(15),
      description: 'TEST FILIALE - TEST BESCHREIBUNG: ' + makeID(150),
      lastRequest: +new Date(),
      width: width,
      height: width === 1080 ? 1920:1080,
      type: width === 1080 ? 'Hoch' : 'Breit',
      orientation: width === 1080 ? 'Hoch' : 'Breit',
      temp: getRndInteger(40,90),
      freeDiskSpace: (filesystem_space-2) + 'G',
      totalDiskSpace: filesystem_space + 'G',
      ip: `10.208.${getRndInteger(0,255)}.${getRndInteger(30,50)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    records.push(device)
  }
  return records
}

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('Devices',generate_devices(250))
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('Devices', null, {})
  }
};
