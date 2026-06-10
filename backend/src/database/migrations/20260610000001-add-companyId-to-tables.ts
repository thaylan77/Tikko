import { QueryInterface, DataTypes } from "sequelize";

const TABLES = [
  "Users",
  "Whatsapps",
  "Contacts",
  "Tickets",
  "Messages",
  "Queues",
  "QuickAnswers",
  "Settings"
];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const table of TABLES) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.addColumn(table, "companyId", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // backfill: tudo pertence à empresa padrão
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const table of TABLES) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.removeColumn(table, "companyId");
    }
  }
};
