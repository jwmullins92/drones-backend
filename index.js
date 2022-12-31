const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors')
const app = express();
require('dotenv').config();
const bcrypt = require('bcrypt')

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const UserModel = require("./models/User");

const saltRounds = 10;


app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    key: "username",
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1000 * 60 * 60 * 24
    }
}))


mongoose.connect(`mongodb+srv://my-user:2aZiI6fXkCHzRkPt@cluster0.itbdo5l.mongodb.net/drone-drop?retryWrites=true&w=majority`, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.once('connected', () => {
    console.log('Database Connected');
})

app.get('/', async (req, res) => {
    res.send("I'M WORKING")
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

app.get("/login", async (req, res) => {
    console.log(req.session)
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    } else {
        res.send({ loggedIn: false })
    }
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await UserModel.findOne({ username })
    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.user = user
                console.log("SESSION")
                console.log(req.session)
                res.send(user)
            } else {
                res.send("Invalid username or password")
            }
        })
    } else {
        res.send("Invalid username or password")
    }
})

app.delete("/logout", async (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send('Unable to log out')
            } else {
                console.log('Logged out')
                res.send('Logged out')
            }
        });
    } else {
        res.send("You are not logged in")
    }
})

app.post('/user', async (req, res) => {
    console.log(req.body)

    bcrypt.hash(req.body.password, 10, async (err, hash) => {

        if (err) {
            console.log(err)
        }

        const user = new UserModel(req.body)
        user.password = hash;
        try {
            const newUser = await user.save();
            res.send(newUser)
        } catch (err) {
            console.log(err)
        }
    })


})

app.delete('/user/:username', async (req, res) => {
    try {
        const user = await UserModel.findOneAndDelete({ username: req.params.username })
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server running on port 8080...')
})