// Permet de vérifier les tokens d'authentification
const jwt = require("jsonwebtoken");
// Importation du package dotenv variables d'environnement
const dotenv = require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    //Extraction du token du header authorization et utilisation de split pour récupérer tous les éléments après l'espace du header
    const token = req.headers.authorization.split(" ")[1];
    //Décode le token
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);
    //Extrait l'id utilisateur et compare à celui extrait du token
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      return res.status(401).json({ message: "Acess Denied" });
    }
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.send(401).json({ message: "Invalid Token" });
  }
};
