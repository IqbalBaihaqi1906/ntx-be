const config = require("../config/db");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: false,
  port: config.DB_PORT,

  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
// db.attackers = require('../models/Attackers')(sequelize, Sequelize);
// define model example
// db.users = require("../models/Users")(sequelize, Sequelize);

// relation example
// relation between role and user
// db.role.hasMany(db.user, {
//   as: "users",
//   onDelete: "cascade",
//   onUpdate: "cascade",
// });

// db.user.belongsTo(db.role, {
//   foreignKey: "roleId",
//   as: "role",
// });

module.exports = db;
