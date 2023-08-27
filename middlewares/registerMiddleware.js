const User = require("../models/user");


const registerMW = async (req, res, next) => {
    const { name, mail, password } = req.body;
    if (name != null && mail != null && password != null) {
        
        const nameCheck = await User.findOne({ where: { name: name } });
        const mailCheck = await User.findOne({ where: { mail: mail } });

        if (nameCheck != null) {
            res.status(500).json({
                error: "This name already exists"
            });
        } else if (mailCheck != null) {
            res.status(500).json({
                error: "This mail already exists"
            });
        } else {
            next();
        }
    } else {
        res.status(500).json({
            error: "nothing can't be null"
        });
    }


}


module.exports = registerMW;

