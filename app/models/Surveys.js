module.exports = (sequelize, Sequelize) => {
  const Surveys = sequelize.define(
    "surveys",
    {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      values: { type: Sequelize.STRING },
      userId: { type: Sequelize.INTEGER },
    },
    { timestamps: false }
  );
  return Surveys;
};