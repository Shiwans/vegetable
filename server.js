require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3010
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')

//database connection

mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
})
const connection = mongoose.connection
mongoose.connection.once('open', () => {
    console.log(`Connection Has Been Made`)
}).on('error', (error) => {
    console.log(`Error is : ${error}`)
})

//Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

//Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_CONNECTION_URL 
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24
    } //24 hours
}))

//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

// //session store
// let mongoStore = new MongoDbStore({
//             mongooseConnection: connection,
//             collection: 'sessions'
//         })

app.use(flash())

//Assets
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)
app.use((req,res)=>{
    res.status(404).render('errors/404')
})

const server = app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`)
})

//spcket
const io = require('socket.io')(server)
io.on('connection',(socket)=>{
    //join
        socket.on('join',(orderId)=>{
        socket.join(orderId)

    })
});

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})
