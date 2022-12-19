const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const aws = require('aws-sdk')
const jwt = require('jsonwebtoken')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const uploadFile = function (file) {

    return new Promise((resolve, reject) => {
        let s3 = new aws.S3({ apiVersion: "2006-03-01" })
        let uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, (err, url) => {
            if (err) { return reject(err) }

            return resolve(url.Location)
        })
    })
}


const createUser = async function (req, res) {

    try {
        let data = req.body;
        let { password } = data;
        let files = req.files;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: "false", message: "All fields are mandatory" });
        }
        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "Profile pic is mandatory" })
        }

        let saltRounds = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, saltRounds);
        data.password = hash;

        let image = await uploadFile(files[0]);
        data.profileImage = image;

        let createData = await userModel.create(data);
        return res.status(201).send({ status: true, data: createData });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const loginUser = async function (req, res) {
    try {
        const { email, password } = req.body
        if (!Object.keys(req.body).length > 0) return res.status(400).send({ status: false, message: 'Input is required' })

        if (!email) return res.status(400).send({ status: false, message: 'Email is required' })

        if (!password) return res.status(400).send({ status: false, message: 'Password is required' })

        let presentUser = await userModel.findOne({ email })
        if (!presentUser) return res.status(401).send({ status: false, message: 'Invalid email' })
        
        let comparePassword = await bcrypt.compare(password, presentUser.password)
        if (!comparePassword) return res.status(401).send({ status: false, message: 'Incorrect password' })
       
        const encodeToken = jwt.sign({ userId: presentUser._id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 }, 'group29')
        let obj = { userId: presentUser._id, token: encodeToken }
        return res.status(200).send({ status: true, data: obj })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const getuser = async function(req, res){
    try{
          let userId = req.params.userId;
          let userLoggedIn =req.token.userId
          if(userId != userLoggedIn){
            return res.status(403).send({status:false, msg:"Authorization failed"})
          }
            let correctdata= await userModel.findById({_id: userId});
            if(!correctdata){
                return res.status(404).send({status:false, message:"No data found"})
            }
            return res.status(200).json({status:true, message: "User profile details", data: correctdata})
          
    }catch(err){
        return res.status(500).json({status:false, message:err.message})
    }
}


module.exports = { createUser, loginUser, getuser }