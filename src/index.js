const express = require('express')
const app = express()

require('dotenv').config()
require('./db/mongoose')
const userRouter = require('./routes/user')
const postsRouter = require('./routes/posts')

// middleware function: runs for every request
// app.use((req, res, next) => {
//     res.status(503).send('Site under maintainance. Check back soon!')
// })

app.use(express.json())
app.use(userRouter)
app.use(postsRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log("Server listening on", PORT)
})