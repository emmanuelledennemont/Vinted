// Je suis dans /route/user.js
const express = require("express");


const router = express.Router();


const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthentificated");
const cloudinary = require("cloudinary").v2;

router.get("/offers", async (req, res) => {
    try { 
        const filter = {};
        const sort = {};
        const pages = 0;

        const numberOfResults = 20;
        if (req.query.title) {
            filter.product_name = new RegExp(req.query.title, "i").select("product_name product_price");
        }
        if (req.query.page) {
            if (req.query.page <= 1) {
                pages = 0;
            } else {
                pages = numberOfResults * (req.query.page - numberOfResults);
            }
        }
        if (req.query.priceMax && req.query.priceMin) {
            filter.product_price = {
                $gte: req.query.priceMin,
                $lte: req.query.priceMax,
            };
        } else if (req.query.priceMax) {
            filter.product_price = {
                $lte: req.query.priceMax,
            };
        } else if (req.query.priceMin) {
            filter.product_price = {
                $gte: req.query.priceMin,
            };
        }
        if (req.query.sort) {
            if (req.query.sort === "price-asc") {
                sort.product_price = 1;
            } else if (req.query.sort === "price-desc") {
                sort.product_price = -1;
            }
        }
        const offers = await Offer.find(filter).skip(pages).limit(numberOfResults).sort(sort).populate({ path : "owner", select : "account"});

        const totalOffers = await Offer.countDocuments(filter);
        res.status(200).json({ offers, totalOffers });
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.post ("/offer/publish",isAuthenticated, async (req, res) => {
    try {
        const {
          title, description, price, brand, size, condition, color, city
        } = req.fields;

        const pictureToUpload = req.files.picture.path;

        const newOffer = await new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                { MARQUE: brand },
                { TAILLE: size },
                { ETAT: condition },
                { COULEUR: color },
                { VILLE: city },
            ],

            owner : req.userWithToken,
        });
        const id = newOffer._id;
        const result = await cloudinary.uploader.upload(pictureToUpload, {
            folder: `/vinted/offers/${id}`,
        });
        newOffer.product_image = result; 
        await newOffer.save();
        res.status(200).json({
            _id: newOffer.id,
            product_name: newOffer.product_name,
            product_description: newOffer.product_description,
            product_price: newOffer.product_price,
            product_details: newOffer.product_details,
            product_image: newOffer.product_image.secure_url,
            owner: req.user.account,
  
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.put("/offer/modify",isAuthenticated, async (req, res) => {
    try {
        const {
            title, description, price, brand, size, condition, color, city
        } = req.fields;

        if (price > 100000) {
            res.status(400).json({
                message: "Price too high",
            });
        } else if (price <= 0) {
            res.status(400).json({
                message: "Price too low",
            });
        } else if (title.length > 50) {
            res.status(400).json({
                message: "Title too short",
            });
        } else if (description.length > 500) {
            res.status(400).json({
                message: "Description too long",
            });
        } else  {
            const newOffer = new Offer ({
                product_name: title,
                product_description: description,
                product_price: price,
                product_details: [
                    { MARQUE: brand },
                    { TAILLE: size },
                    { ETAT: condition },
                    { COULEUR: color },
                    { VILLE: city },
                ],
                owner : req.userWithToken,
            });

          const result = await cloudinary.uploader.upload(req.files.picture.path, {
            folder: `/vinted/offers/${req.fields.id}`,
            });

            newOffer.product_image = result;
            await newOffer.save();
            res.status(200).json({
                _id: newOffer.id,
                product_name: newOffer.product_name,
                product_description: newOffer.product_description,
                product_price: newOffer.product_price,
                product_details: newOffer.product_details,
                product_image: newOffer.product_image.secure_url,
                owner: req.user.account,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.delete ("/offer/delete",isAuthenticated, async (req, res) => {
    try {
        const offerToDelete = await Offer.findById(id);

        if (offerToDelete) {
            await cloudinary.api.delete_resources_by_prefix(
                `api/vinted/offers/${id}`
            );

            await cloudinary.api.delete_folder(`api/vinted/offers/${id}`);

            await offerToDelete.deleteOne();
            res.status(200).json({
                message: "Offer deleted",
            });
        } else {
            res.status(404).json({
                message: "Offer not found",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = router;