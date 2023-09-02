const express = require("express");

const authMiddlewareForStatic = require("../middlewares/authMiddlewareForStatic")
const loginMiddlewareForStatic = require("../middlewares/loginMiddlewareForStatic")
const pageController = require("../controllers/pageController")

const pagesRouter = express.Router();

pagesRouter.route("/admin").get(pageController.index);


pagesRouter.route("/login").get(loginMiddlewareForStatic, pageController.login);
pagesRouter.route("/register").get(loginMiddlewareForStatic, pageController.register);
pagesRouter.route("/profile").get(authMiddlewareForStatic, pageController.profile);

module.exports = pagesRouter;