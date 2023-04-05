// Importation du package express
const express = require("express");
// Permet de créer des routeurs séparés pour chaque route principale
const router = express.Router();
// Importation du middleware authentification pour sécuriser toutes les routes sauces
const auth = require("../middleware/auth");
// Importation du middleware multer pour gérer les routes contenant des images
const multer = require("../middleware/multer-config");
// Importation de la logique métier pour les différentes routes sauces
const sauceCtrl = require("../controllers/sauce");

// Mise en place de toutes les routes nécessaires au traitement des sauces
router.get("/", auth, sauceCtrl.getAllSauces);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
