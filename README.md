#Speller

Speller is a spelling application that helps people improve their spelling. 

##Features

1. Able to create an account
2. Able to create custom word sets for users with an account
3. Can play with randomly generated words

##Technologies Used

1. HTML/EJS - Embedded Javascript Templates
2. CSS/Bootstrap/Font Awesome
3. Javascript/Jquery
4. NodeJS/ExpressJS/Express Session
5. PostgreSQL/node-postgres
6. Axios

##API

Uses the wordsapi to get random words and definitions
https://www.wordsapi.com/docs


##Database design

Users table - id, username, email, password
Custom Sets table - id, words, user_id(relationship with Users table)

##Install Locally

In order to use the application locally, there are a few things required.

1. Local PostgreSQL Database is required for the application following setup in schema.sql
2. .env file is required in the root of the application with the following variables
    PGUSER="User of DB"
    PGHOST="Host of DB"
    PGDATABASE="Name of DB"
    PGPASSWORD="Password for DB"
    PGPORT="Port of DB"
    APIKEY="API key for wordsapi"
    SESSIONSECRET="any text for express-session library"