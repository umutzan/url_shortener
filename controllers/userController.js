const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

function createToken(id) {
    return jwt.sign({ id }, "theKey", {
        expiresIn: "7d",
    });
}

class theUserController {
    async register(req, res, next) {

        User.create(req.body)
            .then((user) => {
                res.status(200).json({
                    success: true,
                    token: createToken(req.body.id),
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }

    async login(req, res) {
        res.status(200).json({
            success: true,
            token: createToken(req.body.id),
        });
    }
}

module.exports = new theUserController();
