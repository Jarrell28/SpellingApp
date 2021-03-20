require("dotenv").config();

const express = require('express');
const { Client } = require('pg');
const axios = require('axios');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: process.env.SESSIONSECRET }))

//Template Engine
app.set('view engine', 'ejs');

//Connecting to Database
const client = new Client();
client.connect(err => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('connected');
    }
});

app.all("/*", function (req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
})

app.get('/', (request, response) => {
    response.render('index', { foo: 'FOO' });
})

app.get('/login', (request, response) => {
    response.render('login', { foo: 'FOO' });
})

app.get('/signout', (request, response) => {
    request.session.destroy();
    response.locals.user = "";
    response.render('index');
})

app.post('/login', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    client.query("SELECT * FROM users WHERE email = $1::text LIMIT 1", [email], (err, results) => {
        if (err) return console.log(err);

        if (!results.rows) {
            response.json({ status: "failed", error: "That email does not exist!" })
        } else {
            const user = results.rows[0];
            if (user.password !== password) {
                response.json({ status: "failed", error: "The email/password combination does not exist!" })
            } else {
                request.session.user = user;

                response.status(200).json({ status: "success", user })
            }
        }
    });
})

app.get('/signup', (request, response) => {
    response.render('signup', { foo: 'FOO' });
})

app.post('/signup', (request, response) => {
    const username = request.body.username;
    const email = request.body.email;
    const password = request.body.password;

    client.query("SELECT * FROM users WHERE email = $1::text LIMIT 1", [email], (err, results) => {
        if (err) return console.log(err);

        if (results.rows) {
            return response.json({ status: "failed", error: "That email already exists!" })
        } else {

            client.query("INSERT INTO users (username, email, password) VALUES($1, $2, $3)", [username, email, password], (err, results) => {
                if (err) return console.log(err);

                client.query("SELECT * FROM users WHERE email = $1::text LIMIT 1", [email], (err, results) => {
                    if (err) return console.log(err);

                    if (!results.rows) {
                        response.json({ status: "failure", error: "Something else went wrong" });
                    } else {
                        const user = results.rows[0];
                        request.session.user = user;
                        response.status(200).json({ status: "success" })
                    }
                })
            })
        }
    });
})

//Gets All Users
app.get('/users', (req, res) => {
    client.query('SELECT * FROM users', (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching users" });

        res.status(200).json(results.rows);
    })
})

//Get User by ID
app.get('/user/:id', (req, res) => {
    const id = parseInt(req.params.id);

    client.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching users" });

        res.status(200).json(results.rows);
    })
})

//Gets Favorites for active user page
app.get('/favorites', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;

    client.query('SELECT * FROM favorites WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching favorites" });

        res.render('favorites', { favorites: res.rows })
    })
})

//Get Favorites for active user game
app.get('/favorites/user', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;

    client.query('SELECT * FROM favorites WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching favorites" });

        res.status(200).json(results.rows);
    })
})


//Gets Custom words for page
app.get('/custom', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;

    client.query('SELECT * FROM custom_sets WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching sets" });

        res.render('custom', { custom: results.rows })
    })
})

//Gets Sets for active user
app.get('/custom/user', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;

    client.query('SELECT * FROM custom_sets WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching sets" });

        res.status(200).json(results.rows);
    })
})

//Add custom word for active user
app.post('/custom/user', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;
    const newWord = req.body.newWord;

    client.query("INSERT INTO custom_sets (words, user_id) VALUES ($1, $2)", [newWord, id], (err, results) => {
        if (err) return console.log(err);

        client.query("SELECT * FROM custom_sets WHERE user_id = $1", [id], (err, results) => {
            if (err) return console.log(err);
            res.json(results.rows);
        })
    })
})

//Fetch 10 Random Words
app.get('/random', (req, res) => {

    const words = [];
    const promises = [];

    const options = {
        method: 'GET',
        url: 'https://wordsapiv1.p.rapidapi.com/words/',
        params: {
            random: 'true',
            frequencymin: '8',
            letterPattern: '^[A-Za-z]+$',
            syllablesMax: '3',
            hasDetails: 'definitions'
        },
        headers: {
            'x-rapidapi-key': process.env.APIKEY,
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
        }
    };

    for (let i = 0; i < 10; i++) {
        promises.push(
            axios.request(options).then(function (response) {
                words.push(response.data);
            })
        )
    }

    Promise.all(promises).then(() => res.status(200).json(words));

})



app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

