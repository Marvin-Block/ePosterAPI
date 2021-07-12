//todo: fix noinspection JSUnresolvedVariable
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  // noinspection JSUnresolvedVariable
  device.init({
    deviceUUID: DataTypes.STRING,
    filNr: DataTypes.STRING,
    location: DataTypes.STRING,
    description: DataTypes.STRING,
    lastRequest: DataTypes.STRING,
    type: DataTypes.STRING,
    orientation: DataTypes.STRING,
    rotation: DataTypes.STRING,
    temp: DataTypes.INTEGER,
    freeDiskSpace: DataTypes.STRING,
    totalDiskSpace: DataTypes.STRING,
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    ip: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'device',
  });
  return device;
};