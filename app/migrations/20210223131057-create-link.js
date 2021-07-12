//todo: fix noinspection JSUnresolvedVariable
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // noinspection JSUnresolvedVariable
    await queryInterface.createTable('links', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      linkUUID: {
        type: Sequelize.STRING
      },
      deviceUUID: {
        type: Sequelize.STRING
      },
      videoUUID: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      start: {
        type: Sequelize.STRING
      },
      end: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      position: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('links');
  }
};