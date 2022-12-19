const jwt = require('jsonwebtoken')

const authentication = async function(req, res){
    try{
const token = req.authorisation["Bearer token"]
if(!token)  return res.status(401).send({status: false, message: 'Token is not present'})

let decodedToken = jwt.verify(token, 'group29', function(error, decodedToken){
    if(error && err.message === 'jwt expired') return res.status(401).send({status: false, message: 'JWT is expired'})
    if(err) return res.status(401).send({status: false, message: error.message})
    if(decodedToken){
        req.decodedToken = decodedToken
        next()
    }
})

    }catch(error){
       return res.status(500).send({status: false, message: error.message})
    }
}


module.exports = { authentication }