const links = require("../models/links");


const registerMW = async (req, res, next) => {

    let isUnique = false;

    function randomLinkID() {
        const min = 100000; // En küçük 6 basamaklı sayı
        const max = 999999; // En büyük 6 basamaklı sayı
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    try {
        let { linkID } = req.body;
        if (linkID == null) {
            while (isUnique = false) {
                linkID = randomLinkID()
                await links.findOne({ where: { linkID: linkID } }).then((data) => {
                    if (data == null) {
                        isUnique = true;
                    }
                })
            }
            next()

        } else {
            const IDCheck = await links.findOne({ where: { linkID: linkID } });

            if (IDCheck == null) {
                next()
            } else {
                res.json({
                    error: "Same link is alrady using"
                });
            }

        }
    } catch (error) {
        console.log(error)
    }


}


module.exports = registerMW;

