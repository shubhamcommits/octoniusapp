const express = require('express')

const bodyParser = require('body-parser')


const app = express()

app.use(require('cors')());

app.use(bodyParser.json())

app.use('/convert-doc', require('./api/app'));

const PORT = 11200;

app.listen (process.env.PORT || PORT, () => {
    console.log("Server Started")
})