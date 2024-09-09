const db = require("../models");
const jwtSecret = require("../config/auth");
const jwt = require("jsonwebtoken")
// const model = db.model;

exampleMiddlewareFunction = (req, res, next) => {
  // do something
  next()
};

AuthenticationMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return res.status(401).json({
        statusCode: 401,
        message: "Authorization Header is required",
        success: false,
      });
    }

    const token = authorization.split(" ")[1];

    if (!token || authorization.split(" ")[0] !== "Bearer") {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid Authorization Header",
        success: false,
      });
    }

    const decoded = jwt.verify(token, jwtSecret.secret);

    const checkUser = await db.sequelize.query(`SELECT * FROM users WHERE digits = '${decoded.digits}' LIMIT 1`);

    if (!checkUser[0].length) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        success: false
      });
    }

    req.user = decoded;
    next()
  } catch (error) {
    console.log('Error on AuthenticationMiddleware:', error);
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized Access",
      success: false,
    });
  }
}

AuthorizationByRoleMiddleware = (roles) => (req, res, next) => {
  try {
    const { user } = req;

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        statusCode: 403,
        message: "Forbidden Access",
        success: false,
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

const verify = {
  exampleMiddlewareFunction: exampleMiddlewareFunction,
  AuthenticationMiddleware,
  AuthorizationByRoleMiddleware,
};

module.exports = verify;
