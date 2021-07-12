//todo: fix noinspection JSUnresolvedVariable
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // noinspection JSUnresolvedVariable
    await queryInterface.createTable('videos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      videoUUID: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.INTEGER
      },
      width: {
        type: Sequelize.INTEGER
      },
      height: {
        type: Sequelize.INTEGER
      },
      md5: {
        type: Sequelize.STRING
      },
      calendarWeek: {
        type: Sequelize.STRING
      },
      orientation_V2: {
        type: Sequelize.STRING
      },
      rotation: {
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
    await queryInterface.dropTable('videos');
  }
};