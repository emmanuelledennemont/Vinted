const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");

// Je suis dans /route/user.js

const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Import du fichier user.js
const loginRoutes = require("./routes/user");
// Je demande Ã  mon serveur d'utiliser les routes prÃ©sentes dans ce fichier
app.use(loginRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);


app.all("*", (req, res) => {
  res.status(404).json("Route introuvable");
});

app.listen(process.env.PORT , () => {
  console.log("Server started");
});
