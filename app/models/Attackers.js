module.exports = (sequelize, Sequelize) => {
  const Attackers = sequelize.define(
    "attackers",
    {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sourceCountry: { type: Sequelize.STRING },
      destinationCountry: { type: Sequelize.STRING },
      millisecond: { type: Sequelize.INTEGER },
      type: { type: Sequelize.STRING },
      weight: { type: Sequelize.STRING },
      attackTime: { type: Sequelize.DATE }
    },
    { timestamps: false }
  );
  return Attackers;
};
