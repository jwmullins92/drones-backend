const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors')
const app = express();
require('dotenv').config();

const UserModel = require("./models/User")


app.use(express.json())
app.use(cors())

mongoose.connect(`mongodb+srv://my-user:${process.env.MONGO_PASSWORD}@cluster0.itbdo5l.mongodb.net/drone-drop?retryWrites=true&w=majority`, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.once('connected', () => {
    console.log('Database Connected');
})

app.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.json(users)
    } catch (err) {
        res.status(500).json({ messgae: err.messgae })
    }
})

app.get('/user/:username', async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.params.username });
        console.log(user)
        res.json(user)
    } catch (err) {
        res.status(500).json({ messgae: err.messgae })
    }
})

app.post('/user', async (req, res) => {
    console.log(req.body)
    const user = new UserModel(req.body)
    try {
        const newUser = await user.save();
        res.send(newUser)
    } catch (err) {
        console.log(err)
    }
})



app.listen(3001, () => {
    console.log('Server running on port 3001...')
})