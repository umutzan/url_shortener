const User = require("../models/user.js");
const jwt = require("jsonwebtoken");


class pageController {
    async index(req, res) {

        res.render("index")

    }

    async login(req, res) {

        res.render("login")

    }

    async register(req, res) {

        res.render("register")

    }
    async profile(req, res) {

        const token = req.cookies.token;
        const id = jwt.verify(token, "theKey").id

        let userInfo = await User.findOne({ where: { id: id } })

        const body = JSON.parse(JSON.stringify(userInfo));




        res.render("profile", {
            body: body,

        })

    }



}

module.exports = new pageController();