const express = require('express'),
    cors = require('cors'),
    { readdirSync } = require('fs'),
    dotenv = require('dotenv'),
    mongoose = require('mongoose'),
    app = express()

dotenv.config()
app.use(express.json())
app.use(cors())

 // routes
readdirSync('./routes').map( r => {
    app.use('/', require('./routes/' + r ))
})

// database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
})
.then(() => console.log(' |> The database has been connected'))
.catch(() => { console.log(' |> There was an error trying to connect to the database')})


const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(' |> The server is running on port: ' + PORT)
})
