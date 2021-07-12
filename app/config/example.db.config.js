const config = require(__dirname + '/../config/config.json')[env];
module.exports = {
  HOST: config.host,
  USER: config.username,
  PASSWORD: config.password,
  DB: config.database,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
