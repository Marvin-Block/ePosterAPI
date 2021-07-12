//todo: fix noinspection JSUnresolvedVariable
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // noinspection JSUnresolvedVariable
    await queryInterface.createTable('devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deviceUUID: {
        type: Sequelize.STRING
      },
      filNr: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      lastRequest: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      orientation: {
        type: Sequelize.STRING
      },
      rotation: {
        type: Sequelize.STRING
      },
      temp: {
        type: Sequelize.INTEGER
      },
      freeDiskSpace: {
        type: Sequelize.STRING
      },
      totalDiskSpace: {
        type: Sequelize.STRING
      },
      width: {
        type: Sequelize.INTEGER
      },
      height: {
        type: Sequelize.INTEGER
      },
      ip: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('devices');
  }
};