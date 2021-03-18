require("dotenv").config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Template Engine
app.set('view engine', 'ejs');


app.get('/', (request, response) => {
    response.render('index', { foo: 'FOO' });
})


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})