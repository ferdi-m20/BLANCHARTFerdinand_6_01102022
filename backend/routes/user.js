// Importation du package express
const express = require("express");
// Permet de créer des routeurs séparés pour chaque route principale
const router = express.Router();
// Importation de la logique métier pour la route auth
const userCtrl = require("../controllers/user");
// Importation du middleware pour limiter les requêtes sur la route user
const limiter = require("../middleware/rate-limiter");

//Mise en place de toutes les routes nécessaires à l'authentification
router.post("/signup", limiter.createAccountLimiter, userCtrl.signup);
router.post("/login", limiter.apiLimiter, userCtrl.login);

/*** Les routes fournies sont celles prévues par l'application front-end,
et le segment de route indiqué ici est uniquement le segment final car 
le reste de l'adresse de la route sera déclaré dans notre application Express ***/

module.exports = router;
