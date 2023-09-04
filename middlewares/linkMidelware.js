const links = require("../models/links");


const linkMW = async (req, res, next) => {

    let isUnique = false;

    function randomLink() {
        const min = 10000; // En küçük 5 basamaklı sayı
        const max = 99999; // En büyük 5 basamaklı sayı
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    try {
        let { link } = req.body;

        if (link == null) {
            while (isUnique == false) {
                let newLink = randomLink().toString()
                await links.findOne({ where: { link: newLink } }).then((data) => {

                    if (data == null) {
                        req.body.link = newLink;
                        isUnique = true;
                    }
                })

            }

            next()


        } else {
            const IDCheck = await links.findOne({ where: { link: link } });

            if (IDCheck == undefined) {
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


module.exports = linkMW;

