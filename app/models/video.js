//todo: fix noinspection JSUnresolvedVariable
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class video extends Model {
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
  video.init({
    videoUUID: DataTypes.STRING,
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    path: DataTypes.STRING,
    size: DataTypes.INTEGER,
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    md5: DataTypes.STRING,
    calendarWeek: DataTypes.STRING,
    orientation_V2: DataTypes.STRING,
    rotation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'video',
  });
  return video;
};
