const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Je suis dans /route/user.js

const app = express();
app.use(formidable());

mongoose.connect("mongodb://localhost/vinted");


cloudinary.config({
  cloud_name: "dpd6msaux",
  api_key: "993446121382641",
  api_secret: "L2Bu1daZVUzuJ07_ir--PJbcBCU",
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

app.listen(3000, () => {
  console.log("Server started");
});
