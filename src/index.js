const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require('./route/route')


app.use(express.json())

mongoose.connect('', {useNewUrlParser: true}, mongoose.set('strictQuery', false))
.then(function(){console.log('mongoDB is connected')})
.catch(function(error){console.log(error)})

app.use('/', route)

app.listen((process.env.Port||3000), function(){
    console.log('Express app running on port '+ (process.env.Port||3000))
})
