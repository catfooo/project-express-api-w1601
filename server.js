import express from "express";
import cors from "cors";
import crypto from 'crypto'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/auth"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const User = mongoose.model('User', {
  name:{
    type: String,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  accessToken:{
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})


// one-way encryption
const user = new User({name: "Bob", password: bcrypt.hashSync("foobar")})
user.save()
  .then((doc) => {
    console.log("User saved successfully:", doc);
  })
  .catch((err) => {
    console.error("Error saving user:", err);
  })

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

const authenticateUser = async ( req, res, next ) => {
  const user = await User.findOne({accessToken: req.header('Authorization')})
  if(user){
    req.user = user;
    next()
  } else {
    res.status(401).json({loggedOut: true})
  }
}

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

app.post('/tweets', authenticateUser)
app.post('/tweets', async (req, res) => {
  // This will only happen if the next() function is called from the middleware!
  // now we can access the req.user object from the middleware
})

app.post('/sessions', async (req, res) => {
  const user = await User.findOne({name: req.body.name})
  if(user && bcrypt.compareSync(req.body.password, user.password)){
    // Success
    res.json({userId: user._id, accessToken: user.accessToken})
  } else {
    // Failure
    // a. User does not exist
    // b. Encrypted password does not match
    res.json({notFound: true})
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

console.log(bcrypt.hashSync("foobar"))
