const db = require('../database/db');
const fs = require('fs');
const { getSignedUrl, getSignedCookies } = require("@aws-sdk/cloudfront-signer");

exports.getAllUsers = async (req, res) => {

    try {
        // const data = await db.query('SELECT * FROM users;');

        const privateKey = fs.readFileSync('./private_key.pem', { encoding: "ascii" });
        const url = "https://d1cupj4wyzfq3d.cloudfront.net/valgau-be-zalos-virtuve-vii-fizinis-ir-emocinis-alkis.mp4";
        const signedUrl = getSignedUrl({
            url,
            keyPairId: 'KPQGMPR9KLNK4',
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 60),
            privateKey,
          });
        res.status(200).json({
            // users: data.rows,
            key: signedUrl
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};