const { exampleMiddleware } = require("../middleware");
const exampleController = require("../controllers/exampleController");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  router.get(
    "/refactorme1",
    exampleMiddleware.AuthenticationMiddleware,
    exampleMiddleware.AuthorizationByRoleMiddleware(['user', 'admin']),
    exampleController.refactoreMe1
  );

  router.post(
    "/refactorme2",
    exampleMiddleware.AuthenticationMiddleware,
    exampleMiddleware.AuthorizationByRoleMiddleware(['user']),
    exampleController.refactoreMe2,
  );

  router.get(
    "/attackers",
    exampleMiddleware.AuthenticationMiddleware,
    exampleMiddleware.AuthorizationByRoleMiddleware(['user', 'admin']),
    exampleController.getData,
  )

  app.use("/api/data/", router);
};
