const User = require("../models/User");
const Offer = require("../models/Offer");


const isAuthenticated = async (req, res, next) => {

    if (req.headers.authorization) {
      
    const token = req.headers.authorization.replace("Bearer ", "");

    const userWithToken = await User.findOne({ token: token }).select("account _id");
    
    if (userWithToken) {
        req.user = userWithToken;
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
  

  module.exports = isAuthenticated;