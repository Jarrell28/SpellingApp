require("dotenv").config();

const express = require('express');
const { Client } = require('pg');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

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

app.get('/', (request, response) => {
    response.render('index', { foo: 'FOO' });
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

//Gets All Favorites
app.get('/favorites', (req, res) => {
    client.query('SELECT * FROM favorites', (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching favorites" });

        res.status(200).json(results.rows);
    })
})

//Get Favorites for one User
app.get('/favorites/:id', (req, res) => {
    const id = parseInt(req.params.id);

    client.query('SELECT * FROM favorites WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching favorites" });

        res.status(200).json(results.rows);
    })
})

//Gets All Sets
app.get('/sets', (req, res) => {
    client.query('SELECT * FROM custom_sets', (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching sets" });

        res.status(200).json(results.rows);
    })
})

//Gets Sets for one User
app.get('/sets/:id', (req, res) => {
    const id = parseInt(req.params.id);

    client.query('SELECT * FROM custom_sets WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching sets" });

        res.status(200).json(results.rows);
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
                words.push(response.data.word);
            })
        )
    }

    Promise.all(promises).then(() => res.status(200).json(words));

})



app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

