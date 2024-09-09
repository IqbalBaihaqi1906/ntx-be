module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define(
    "users",
    {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      digits: { type: Sequelize.STRING(155), unique: true },
      fotoUrl: { type: Sequelize.STRING() },
      workType: { type: Sequelize.STRING(100) },
      positionTitle: { type: Sequelize.STRING(100) },
      lat: { type: Sequelize.FLOAT },
      lon: { type: Sequelize.FLOAT },
      company: { type: Sequelize.STRING(155) },
      isLogin: { type: Sequelize.BOOLEAN },
      dovote: { type: Sequelize.BOOLEAN, defaultValue: false },
      dosurvey: { type: Sequelize.BOOLEAN, defaultValue: false },
      dofeedback: { type: Sequelize.BOOLEAN, defaultValue: false },
      fullname: { type: Sequelize.STRING },
      currentLeave: { type: Sequelize.INTEGER },
      role: { type: Sequelize.STRING(50) },
      password: { type: Sequelize.TEXT },
    },
    { timestamps: false }
  );
  return Users;
};