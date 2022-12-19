const userModel  = require('../models/userModel')

const createUser = async function(req, res){

try{




}catch(error){
    res.status(500).send({status: false, message: error.message})
}
}

module.exports = { createUser }