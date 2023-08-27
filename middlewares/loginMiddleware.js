const User = require("../models/user");

const loginMW = async (req, res, next) => {

    let { id, mail, password } = req.body;
    try {
        const user = await User.findOne({ where: { mail: mail } })
        if (user.password == password) {
            next();
        } else {
            res.status(500).send("şifre yanlış");

        }
    } catch {
        res.status(500).send("mail yanlış");

    }

}

module.exports=loginMW;