const userController = require("../controllers/userController");
const { exampleMiddleware } = require("../middleware");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  router.post(
    "/register",
    exampleMiddleware.AuthenticationMiddleware,
    exampleMiddleware.AuthorizationByRoleMiddleware(["admin"]),
    userController.register,
  )

  router.post(
    "/login",
    userController.login,
  )

  app.use("/api/user/", router);
};
