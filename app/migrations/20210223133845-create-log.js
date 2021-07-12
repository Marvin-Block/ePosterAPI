//todo: fix noinspection JSUnresolvedVariable
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // noinspection JSUnresolvedVariable
    await queryInterface.createTable('logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      route: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      params: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.STRING(1500)
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
    await queryInterface.dropTable('logs');
  }
};