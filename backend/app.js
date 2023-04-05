// Importation des packages Express et mongoose
const express = require("express");
const mongoose = require("mongoose");

// Importation du package path permettant d'accéder au chemin de notre serveur
const path = require("path");

// Récupération des routes
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

// Initialise express
const app = express();

// Header requête grâce au package cors
const cors = require("cors");
app.use(cors());

// *** Securité OWASP *** //

// Importation du package dotenv variables d'environnement
const dotenv = require("dotenv").config();

// Importation du package helmet permettant de sécuriser les en-tête
const helmet = require("helmet");
// Configuration des en-têtes HTTP
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// Permet de masquer le framework utilisé, Express dans notre cas
app.disable("x-powered-by");

// Intercepte req qui ont un content type json et met à dispo corps de la requete
app.use(express.json());

// Connection à la base de données MongoDB Atlas
mongoose
  // process.env.DB_CONNECTION, c'une variable d'environnement qui contient le lien pour connecter à notre DB
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée"));

// Route de base commune aux sauces ou à l'authentification
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

// Gère la ressource "images" de manière statique à chaque fois qu'elle reçoit une requête vers la route "/images"
app.use("/images", express.static(path.join(__dirname, "images")));

// Exportation app.js
module.exports = app;
