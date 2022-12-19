const jwt = require('jsonwebtoken')

const authentication = async function (req, res, next) {
    try {
        const headerAuth = req.headers["authorization"]
        const split = headerAuth.split(' ')
        let token = split[1]
        if (!token) return res.status(401).send({ status: false, message: 'Token is not present' })

        jwt.verify(token, 'group29', function (error, decodedToken) {
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