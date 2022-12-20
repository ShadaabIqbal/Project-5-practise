const jwt = require('jsonwebtoken')

const authentication = async function (req, res, next) {
    try {
        let authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(400).send({ status: false, Error: "Enter Token in BearerToken" });
        }

        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];
        if (!bearerToken) {
            return res.status(403).send({ status: false, message: "Token not present" });
        }

        jwt.verify(bearerToken, 'group29', function (error, decodedToken) {
            if (error && error.message === 'jwt expired') return res.status(401).send({ status: false, message: 'JWT is expired' })
            if (error) return res.status(401).send({ status: false, message: error.message })
            else {
                req.decodedToken = decodedToken
                next()
            }
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { authentication }