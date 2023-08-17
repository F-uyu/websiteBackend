//express------------
const express = require('express');
const app = express();
const bodyParser = require("body-parser")
const session = require('express-session')
const cors = require('cors')
const mongoose = require('mongoose')
const UserModel = require("./models/Users")
const pako = require('pako')
const Axios = require('axios')
app.set("trust proxy", 1)
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}))
require('dotenv').config()
const RAND = process.env.MONG_URI
mongoose.connect(RAND)
const MongoStore = require('connect-mongodb-session')(session)
let sessionStore = new MongoStore({
    uri: 'mongodb+srv://Fuyu:Slayer24@cluster0-pri.7sujvda.mongodb.net/info?retryWrites=true&w=majority', //'mongodb+srv://Fuyu:Slayer24@cluster0.7sujvda.mongodb.net/listofusers?retryWrites=true&w=majority'
    collection: 'info'
})

//express begin----------------
app.use(session({
  secret: 'thisasecret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  /*proxy: true,
    cookie:{
        secure: true,
        maxAge: 1000 * 60 * 60 * 48,
        httpOnly: true,
        sameSite: 'none',
        //sameSite: 'none',
        //domain: '.uw.r.appspot.com'
    }*/
}))
app.use(express.json())
app.use(cors({
    origin: 'https://f-uyu.github.io', //'http://localhost:3000'
    credentials: true
}))

//websocket-------------
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const clients = new Map();
const matchmake = new Map()
io.on('connection', (socket) => {
  console.log('A new client connected');
  socket.on('matchmaking', (data) => {
    matchmake.set(data.id, socket)
    console.log(matchmake.size)
    if (matchmake.size >= 2){
      const keysArray = Array.from(matchmake.keys())
      const first = keysArray[0]
      const second = keysArray[1]
      Axios.get('https://us-lax-97d18217.colyseus.cloud').then((response) => {
        const firstsocket = matchmake.get(first)
        const secondsocket = matchmake.get(second)
        firstsocket.emit('matched', {data: response.data.roomId})
        secondsocket.emit('matched', {data: response.data.roomId})
        matchmake.delete(first)
        matchmake.delete(second)
        console.log(matchmake.size)
      })
      
    }
  })
  socket.on('register', ({userId, status}) => {
    io.emit('updateCanvas')
  })
  socket.on('login', ({id}) => {
    clients.set(id, socket);
  });

  socket.on('out', (data) => {
    //const userId = [...clients.entries()].find(([_, socketEntry]) => socketEntry === socket) ? [...clients.entries()].find(([_, socketEntry]) => socketEntry === socket)[0] : null;
    if (clients.has(data)) {
      clients.delete(data);
    }
  });
});



//paths------------------

app.get('/', (req, res) => {
  res.send('Hello from App !');
});

app.post("/login", async (req, res, next) => {
  //res.setHeader('Access-Control-Allow-Private-Network', 'true');
 //console.log("Login------------")
  //console.log(req.sessionID)
  const {username, password} = req.body
  let user = await UserModel.findOne({username: username, password: password})
  const id = user._id.toString()
  req.session.userId = id
  req.session.userName = username
  req.session.picture = ""
  req.session.qr = ""
  req.session.online = true
  res.send(id)
  //next()
})


app.get("/currentuser", async (req, res) => {
  if (req.session.userId){
    res.send(req.session.userId)
  }
  else{
    res.end()
  }
})

//check if user is logged in
app.get("/checkLogin", async (req, res, next) => {
  //console.log("CheckLogin------------")
  //console.log(req.sessionID)
  if (req.session.userId){
      res.send(true)
  }
  else{
      res.end()
  }
})


//get list of users
app.get("/getUsers", async (req, res, next) => {
  //req.session.lol = "xd"
  //console.log("GetUsers------------")
  //console.log(req.sessionID)
  const data = await UserModel.find({})
  res.send(data)
})



//register
app.post("/createUser", async (req, res) => {
  const user = req.body
  user.profilePicture = 'data:image/jpeg;base64,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'
  const newUser = new UserModel(user)
  await newUser.save()
  res.json(user)
})

app.post("/setpfp", async (req, res) => {
  const uncompressed = pako.ungzip(req.body.profilePicture, {to: 'string'})
  const id = req.session.userId
  let user = await UserModel.findById(id)
  //console.log(uncompressed)
  user.profilePicture = uncompressed
  //console.log(user)
  await user.save()
  req.session.picture = uncompressed
  res.end()
})

app.get("/getpfp",
  (req, res, next) => {
      if (req.session.userName){
          next()
      }
      else{
          res.send('bad')
      }
  },
  async (req, res) => {
      //console.log("getpfp------------")
      //console.log(req.session)
      let currpfp = null
      const id = req.session.userId
      let user = await UserModel.findById(id)
      if (user != null){
          if (user.profilePicture){
              req.session.picture = user.profilePicture
              currpfp = user.profilePicture
          }
      }
      res.send(currpfp)
})

app.post("/setqr", async (req, res) => {
  const secret = req.body.secret
  const id = req.session.userId
  req.session.qr = secret
  let user = await UserModel.findById(id)
  user.qrCode = secret
  await user.save()
  res.end()
})

app.get("/getqr", async (req, res) => {
  const id = req.session.userId
  let user = await UserModel.findById(id)
  if (user != null){
      if (user.qrCode != ""){
          res.send(user.qrCode)
      }
      else{
          res.send("null")
      }
  }
  else{
      res.end()
  }
})

//sign out
app.get("/signout", async (req, res) => {
  console.log("signout------------")
  let id = req.session.userId
  req.session.destroy()
  res.clearCookie('connect.sid')
  res.send(id)
})


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});