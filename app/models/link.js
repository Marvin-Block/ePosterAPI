//todo: fix noinspection JSUnresolvedVariable
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class link extends Model {
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
  link.init({
    linkUUID: DataTypes.STRING,
    deviceUUID: DataTypes.STRING,
    videoUUID: DataTypes.STRING,
    name: DataTypes.STRING,
    start: DataTypes.STRING,
    end: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    position: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'link',
  });
  return link;
};