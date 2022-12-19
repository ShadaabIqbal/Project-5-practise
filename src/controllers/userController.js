const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const aws = require('aws-sdk')

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
        let {password} = data;
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

module.exports = { createUser }