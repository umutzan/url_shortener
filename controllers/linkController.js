const links = require("../models/links.js");

class linkController {
    async link(req, res) {

        const id = req.params.id;
        await links.findOne({ where: { linkID: id } }).then((data) => {
            if (data == null) {
                res.status(500).send("31");

            } else {
                res.redirect(data.link);
            }
        })
    }


}

module.exports = new linkController();
