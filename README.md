Project Description

#Application main purpose is to help people improve their spelling

#Features
1. Able to create an account or play as guest
2. Able to create custom word sets
3. Can play with randomly generated words
4. Able to favorite random words
5. Flashcards - enter complete word and submit to check if its correct
6. Word by Word check - User gets indication if correct by letter input
7. View Custom sets created by other users

#API
Uses the wordsapi to get random words and definitions
Can get random words
Can get definition of words
Can get how frequent the word is used
Can get pronunciation
https://www.wordsapi.com/docs/

#Database design
Users table - id, username, email, password, relationships [ favorites, custom sets]
Favorites table - id, wordname, 
Custom Sets table - id, string of words