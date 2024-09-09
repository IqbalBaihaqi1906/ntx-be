const db = require("../models")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/auth')

exports.register = async (req, res) => {
  try {
    const { digits, password, fullname } = req.body;

    if (!digits || !password || !fullname) {
      return res.status(400).json({
        statusCode: 400,
        message: "Please provide all required fields",
        success: false,
      });
    }

    const checkUser = await db.sequelize.query(`SELECT * FROM users WHERE digits = '${digits}'`);

    if (checkUser[0].length) {
      return res.status(400).json({
        statusCode: 400,
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.sequelize.query(
      `INSERT INTO users ("digits", "password", "fullname", "createdAt", "updatedAt", "role") VALUES ('${digits}', '${hashedPassword}', '${fullname}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'user')`,
    );

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: {
        digits,
        fullname,
      },
    });
  } catch (error) {
    console.log('Error on login:', error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
}

exports.login = async (req, res) => {
  try {
    const { digits, password } = req.body;

    if (!digits || !password) {
      return res.status(400).json({
        statusCode: 400,
        message: "Please provide all required fields",
        success: false,
      });
    }

    const checkUser = await db.sequelize.query(`SELECT * FROM users WHERE digits = '${digits}'`);

    if (!checkUser[0].length) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        success: false,
      });
    }

    const user = checkUser[0][0];

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid credentials",
        success: false,
      });
    }

    const jwtPayload = {
      id: user.id,
      digits: user.digits,
      fullname: user.fullname,
      role: user.role,
    }
    
    const token = jwt.sign(jwtPayload, jwtSecret.secret, { expiresIn: '3h' });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: {
        accessToken: token,
      }
    })
  } catch (error) {
    console.log("Error on login:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
}