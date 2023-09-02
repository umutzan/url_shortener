const User = require("../../models/user");
const jwt = require("jsonwebtoken")


const loginMW = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            theUser = await User.findByPk(
                jwt.verify(token, "theKey").id
            );
            if (theUser) {
                res.redirect("/admin/profile")
            } else {
                next();
            }
        } else {
            next();

        }
    } catch (error) {
        next();
    }
}


module.exports = loginMW;