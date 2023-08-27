const express = require("express");
const registerMiddleware = require("../middlewares/registerMiddleware.js");
const loginMiddleware = require("../middlewares/loginMiddleware.js");
const sha256MW = require("../middlewares/sha256Middleware.js");
const linkIdMW = require("../middlewares/linkIdMidelware.js")
const linkAdderC = require("../controllers/linkAdderController.js")
const userController = require("../controllers/userController.js")

const apiRouter = express.Router();

apiRouter.route("/register").post(registerMiddleware, sha256MW, userController.register);
apiRouter.route("/login").post(sha256MW, loginMiddleware, userController.login);

apiRouter.route("/newlink").post(linkIdMW, linkAdderC.linkAdder);

module.exports = apiRouter;
