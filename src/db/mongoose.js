const mongoose = require('mongoose')

mongoose.connect(process.env.DBurl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})