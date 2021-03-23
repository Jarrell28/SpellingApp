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
const client = new Client({
    ssl: {
        rejectUnauthorized: false, //Required for production. Remove on local
    }
});
client.connect(err => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('connected');
    }
});

//If a user is logged in, passes session details to all pages of application
app.all("/*", function (req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
})


//HTML ROUTES

//Home Page
app.get('/', (request, response) => {
    response.render('index');
})

//Login Page
app.get('/login', (request, response) => {
    response.render('login');
})

//Signout Page
app.get('/signout', (request, response) => {
    //resets session details on signout
    request.session.destroy();
    response.locals.user = "";
    response.render('index');
})

//Signup Page
app.get('/signup', (request, response) => {
    response.render('signup');
})

//Database Query ROUTES

//Login to account
app.post('/login', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    //Checks if email exists in DB
    client.query("SELECT * FROM users WHERE email = $1::text LIMIT 1", [email], (err, results) => {
        if (err) return console.log(err);

        //If no email, alerts error on client side
        if (results.rows.length === 0) {
            response.json({ status: "failed", error: "That email does not exist!" })
        } else {
            const user = results.rows[0];
            //If passwords do not match, alerts error on client side
            if (user.password !== password) {
                response.json({ status: "failed", error: "The email/password combination does not exist!" })
            } else {
                //Sets session user and sends user data to client
                request.session.user = user;
                response.status(200).json({ status: "success", user })
            }
        }
    });
})


//Create an account
app.post('/signup', (request, response) => {
    const username = request.body.username;
    const email = request.body.email;
    const password = request.body.password;

    //Checks if user exists with that email
    client.query("SELECT * FROM users WHERE email = $1::text LIMIT 1", [email], (err, results) => {
        if (err) return console.log(err);

        //If user already exists, alert error on client side
        if (results.rows.length > 0) {
            return response.json({ status: "failed", error: "That email already exists!" })
        } else {
            //Creates the new user
            client.query("INSERT INTO users (username, email, password) VALUES($1, $2, $3)", [username, email, password], (err, results) => {
                if (err) return console.log(err);

                //Makes another query to get the newly created user
                client.query("SELECT * FROM users WHERE email = $1::text LIMIT 1", [email], (err, results) => {
                    if (err) return console.log(err);

                    //If no results received, error in process
                    if (!results.rows) {
                        response.json({ status: "failure", error: "Something else went wrong" });
                    } else {
                        //Received new user from query, set session details and send success to client
                        const user = results.rows[0];
                        request.session.user = user;
                        response.status(200).json({ status: "success" })
                    }
                })
            })
        }
    });
})



//Shows Custom Words page and Queries Custom words for current user
app.get('/custom', (req, res) => {
    //Redirects to login page if no user
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



//Create new custom word for active user
app.post('/custom/user', (req, res) => {
    //Redirects to login page if no user
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;
    const newWord = req.body.newWord;

    //Creates new word in DB
    client.query("INSERT INTO custom_sets (words, user_id) VALUES ($1, $2)", [newWord, id], (err, results) => {
        if (err) return console.log(err);

        //Queries all custom words for active user
        client.query("SELECT * FROM custom_sets WHERE user_id = $1", [id], (err, results) => {
            if (err) return console.log(err);

            //Sends all words to client for list rerender
            res.json(results.rows);
        })
    })
});

//Route to DELETE custom word
app.delete('/custom/:id', (req, res) => {
    //Redirects to login page if no user
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.params.id;
    const userId = req.session.user.id;

    //Deletes custom word by ID
    client.query("DELETE FROM custom_sets WHERE id =$1", [id], (err, results) => {
        if (err) return console.log(err);

        //Queries all custom words for active user
        client.query("SELECT * FROM custom_sets WHERE user_id = $1", [userId], (err, results) => {
            if (err) return console.log(err);

            //Sends all words to client for list rerender
            res.json(results.rows);
        })
    })

});

//Updates custom word
app.put('/custom/:id', (req, res) => {
    const id = req.params.id;
    const word = req.body.word;

    //Updates current word by id
    client.query("UPDATE custom_sets SET words=$1 WHERE id=$2 RETURNING *", [word, id], (err, results) => {
        if (err) return console.log(err);

        //Sends the updated word to client for list rerender
        res.json(results.rows);
    })
})

//API ROUTES

//Fetch 10 Random Words
app.get('/random', (req, res) => {

    const words = [];
    const promises = [];

    //Axios option object for request
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

    //Loops 10 times to get 10 words
    for (let i = 0; i < 10; i++) {

        //Adds the promise to promises array
        promises.push(

            //Request to get words from API
            axios.request(options).then(function (response) {
                words.push(response.data);
            })
        )
    }

    //When all promises are finished from promises array, sends 10 words to client
    Promise.all(promises).then(() => res.status(200).json(words));

})

//Fetches custom words for active user from DB, Makes API call to get definition of words
app.get('/custom/game', (req, res) => {
    //Redirects to login page if no user
    if (!req.session.user) {
        return res.json({ status: "failure" });
    }
    const id = req.session.user.id;
    const words = [];
    const promises = [];

    //Makes Query from DB
    client.query('SELECT * FROM custom_sets WHERE user_id = $1', [id], (err, results) => {
        if (err) res.status(400).json({ error: "Error occurred fetching sets" });

        let rows = results.rows;

        //Loops results from DB query to fetch word defintion from API
        rows.forEach(word => {

            //Axios option object for request
            const options = {
                method: 'GET',
                url: `https://wordsapiv1.p.rapidapi.com/words/${word.words}`,
                headers: {
                    'x-rapidapi-key': process.env.APIKEY,
                    'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
                }
            };

            //Adds the promise to promises array
            promises.push(
                //Request to get words from API
                axios.request(options).then(function (response) {
                    words.push(response.data);
                }).catch(function (error) {
                    //If no definition is found for custom word, adds the word to object with empty definition
                    words.push({ word: word.words, results: [{ definition: "Definition not found" }] })
                })
            )
        })

        //When all promises are finished from promises array, sends 10 words to client
        Promise.all(promises).then(() => res.status(200).json(words));

    })
})


//Express port listener
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

