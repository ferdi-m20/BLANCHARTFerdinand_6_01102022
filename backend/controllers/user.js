// Importation du package bcrypt permettant de chiffrer les données
const bcrypt = require("bcrypt");
// Importation du package jsonwebtoken permettant de vérifier les tokens d'authentification
const jwt = require("jsonwebtoken");
// Importation du modèle User
const User = require("../models/User");
// Importation du package dotenv variables d'environnement
const dotenv = require("dotenv").config();

// Importation de la fonction userValidation du fichier validation.js
const { userValidation } = require("../validation");

// Création de l'utilisateur et du mot de passe + salage
exports.signup = (req, res, next) => {
  // userValidation permet de vérifier et valider les infos provenant du formulaire avant d'enregistrer à la DB
  const { error } = userValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Appel de bcrypt qui hashe le mot de passe 10 fois ici et renvoie une promise
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      //Conversion de l'objet "User" en une chaîne "user"
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      //Enregristre dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  // userValidation permet de vérifier et valider les infos provenant du formulaire avant d'enregistrer à la DB
  const { error } = userValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  /* Nous utilisons notre modèle Mongoose pour vérifier que l'email entré par l'utilisateur 
  correspond à un utilisateur existant de la base de données. */
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      // S'il existe compare le mot de passe reçu avec le hash dans la base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            /* S'ils ne correspondent pas, nous renvoyons une erreur 401 Unauthorized avec le même message
            que lorsque l’utilisateur n’a pas été trouvé, afin de ne pas laisser quelqu’un vérifier
            si une autre personne est inscrite sur notre site. */
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          /* S'ils correspondent, les informations d'identification de notre utilisateur sont valides. 
          Dans ce cas, nous renvoyons une réponse 200 contenant l'ID utilisateur et un token. */
          res.status(200).json({
            userId: user._id,
            /* Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token. 
            Ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token). */
            token: jwt.sign(
              { userId: user._id },
              // Si user/MPD correct, on renvoi un token signé (chiffrage secret)
              process.env.RANDOM_TOKEN_SECRET,
              // Durée de validité et demande une reconnection au bout de 24h
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
