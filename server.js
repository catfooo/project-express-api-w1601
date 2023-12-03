import express from "express";
import cors from "cors";
import crypto from 'crypto'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'

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

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

console.log(bcrypt.hashSync("foobar"))
