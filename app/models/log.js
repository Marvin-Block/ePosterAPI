//todo: fix noinspection JSUnresolvedVariable
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  // noinspection JSUnresolvedVariable,JSUnresolvedFunction
  log.init({
    route: DataTypes.STRING,
    method: DataTypes.STRING,
    params: DataTypes.STRING,
    body: DataTypes.STRING(1500),
    ip: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'log',
  });
  return log;
};