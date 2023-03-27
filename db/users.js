const client = require('./client');

const bcrypt = require('bcrpyt');

async function createUser({username, password}) 