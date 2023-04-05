// Importation du modèle Sauce
const Sauce = require("../models/Sauce");
// Importation du module file system pour Multer
const fs = require("fs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const dotenv = require("dotenv").config();

// Importation du package file-type
const fileTypeFromFile = require("file-type-cjs");

/************************* Créer une Sauce *************************/

/* Capture et enregistre l'image, analyse la sauce transformée en chaîne de caractères et 
l'enregistre dans la base de données en définissant correctement son imageUrl. 
Initialise les likes et dislikes de la sauce à 0 et les usersLiked et usersDisliked avec des tableaux vides. */

exports.createSauce = async (req, res, next) => {
  // On initialise un array contenant les mimes types attendus
  const whitelist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  /* File type permet de vérifier le type de fichier en analysant 
  les signatures binaires du fichier (magic number) à partir d'un flux */
  const stream = fs.createReadStream(req.file.path);
  const checkFileType = await fileTypeFromFile.fromStream(stream);

  // Si le mime type du fichier entrant ne correspond pas à whitelist
  if (!whitelist.includes(checkFileType.mime)) {
    // On supprime le fichier dans notre dossier local /images et on envoie un message d'erreur
    const filename = req.file.filename;
    fs.unlinkSync(`images/${filename}`);
    return next(new Error("Only .jpg, .jpeg, .png and .webp format allowed!"));
  }

  // Création d'une constante pour obtenir un objet utilisable
  const sauceObject = JSON.parse(req.body.sauce);
  // Suppression de l'_id envoyé par le front-end
  delete sauceObject._id;
  delete sauceObject._userId;
  // Conversion de l'objet "Sauce" en une chaîne "sauce"
  const sauce = new Sauce({
    ...sauceObject,
    // Utilisation de l'URL complète de l'image
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    // likes: 0,
    // dislikes: 0,
    // usersLiked: [""],
    // usersDisliked: [""],
  });
  // Enregistre dans la base de données
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

/************************* Modifier une Sauce *************************/

/* Met à jour la sauce avec l'_id fourni. 
Si une image est téléchargée, elle est capturée et l’imageUrl de la sauce est mis à jour. 
Si aucun fichier n'est fourni, les informations sur la sauce se trouvent directement dans le corps de la requête (req.body.name, req.body.heat, etc.). 
Si un fichier est fourni, la sauce transformée en chaîne de caractères se trouve dans req.body.sauce */

exports.modifySauce = async (req, res, next) => {
  /*
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
    */

  if (req.file) {
    // On initialise un array contenant les mimes types attendus
    const whitelist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    /* File type permet de vérifier le type de fichier en analysant 
    les signatures binaires du fichier (magic number) à partir d'un flux */
    const stream = fs.createReadStream(req.file.path);
    const checkFileType = await fileTypeFromFile.fromStream(stream);

    // Si le mime type du fichier entrant ne correspond pas à whitelist
    if (!whitelist.includes(checkFileType.mime)) {
      // On supprime le fichier dans notre dossier local /images et on envoie un message d'erreur
      const filename = req.file.filename;
      fs.unlinkSync(`images/${filename}`);
      return next(
        new Error("Only .jpg, .jpeg, .png and .webp format allowed!")
      );
    }
    // Si l'image est modifiée, on supprime l'ancienne image dans /images
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        // On vérifie que la sauce appartient bien à l'utilisateur
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({ message: "Non-autorisé !" });
        }
        // Si c'est le cas, on supprime l'image concerné dans /images
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          const sauceObject = {
            /* Pour ajouter un fichier à la requête, le front-end doit envoyer les données de la requête 
            sous la forme form-data et non sous forme de JSON. 
            Le corps de la requête contient une chaîne sauce, qui est simplement un sauceObject converti en chaîne. 
            Nous devons donc l'analyser à l'aide de JSON.parse() pour obtenir un objet utilisable. */
            ...JSON.parse(req.body.sauce),
            // On met à jour le nouveau chemin pour imageUrl
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          };
          // Suppression de l'_id envoyé par le front-end
          delete sauceObject._userId;
          // Crée une instance "Sauce" à partir de "sauceObject" et on met à jour les infos dans la DB avec images
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else {
    // Si l'image n'est pas modifée
    Sauce.findOne({ _id: req.params.id })
      // On vérifie que la sauce appartient bien à l'utilisateur
      .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({ message: "Non-autorisé !" });
        } else {
          const sauceObject = { ...req.body };
          // Suppression de l'_id envoyé par le front-end
          delete sauceObject._userId;
          // Crée une instance "Sauce" à partir de "sauceObject" et on met à jour les infos dans la DB sans images
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() =>
              res.status(200).json({ message: "Sauce modifiée avec succès !" })
            )
            .catch((error) => res.status(401).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  }
};

/************************* Supprimer une Sauce *************************/

exports.deleteSauce = (req, res, next) => {
  /* Utilisation de la méthode findOne() du modèle Mongoose qui renvoit la Sauce 
  ayant le même _id que le paramètre de la requête */
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // On verifie que la sauce appartient bien à l'utilisateur
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé !" });
      } else {
        // Séparation du nom du fichier grâce au "/images/"" contenu dans l'url
        const filename = sauce.imageUrl.split("/images/")[1];
        // Utilisation de la fonction unlink pour supprimer l'image et suppression de toute la Sauce
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce Supprimée !" });
            })
            .catch((error) => {
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/************************* Afficher toutes les Sauces *************************/

exports.getAllSauces = (req, res, next) => {
  /* Utilisation de la méthode find() du modèle Mongoose qui renvoit 
  un tableau de toutes les Sauces de notre base de données */
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/************************* Afficher une Sauce *************************/

exports.getOneSauce = (req, res, next) => {
  /* Utilisation de la méthode findOne() du modèle Mongoose qui renvoit 
  la Sauce ayant le même _id que le paramètre de la requête */
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

/************************* Liker ou Disliker une Sauce *************************/

exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId; //on accède à l'user qui a aimé
  const like = req.body.like; //on accede au corps rêq de like
  const sauceId = req.params.id; //on accède à l'id de la sauce

  /* 

  Sauce.findOne({ _id: sauceId }) // On cherche l'id dans la base de donnée
    .then((sauce) => {
      // like = 1 (likes +1 ) Si userId n'est pas dans le tableau usersLiked et que like est égal à 1
      // Pouce vert activé (front-end)
      if (!sauce.usersLiked.includes(userId) && like === 1) {
        Sauce.updateOne(
          { _id: sauceId }, //mets à jour l'User en incluant l'id
          {
            $inc: { likes: 1 }, //$inc Incrémente la valeur du champ du montant spécifié.
            $push: { usersLiked: userId }, //$push Ajoute un élément à un tableau.
          }
        )
          .then(() => res.status(201).json({ message: "User like +1" }))
          .catch((error) => res.status(400).json({ error }));
      }
      //like = 0 (likes = 0) Si userId est dans le tableau usersLiked et que like est égal à 0
      // Pouce vert désactivé (front-end) like annulé
      if (sauce.usersLiked.includes(userId) && like === 0) {
        Sauce.updateOne(
          { _id: sauceId },
          {
            $inc: { likes: -1 }, //$inc opérateur mongoDB incrémente
            $pull: { usersLiked: userId }, //$pull Supprime tous les éléments du tableau qui correspondent à une requête spécifiée.
          }
        )
          .then(() => res.status(201).json({ message: "User like 0" }))
          .catch((error) => res.status(400).json({ error }));
      }

      //like -1 (dislikes +1) Si userId n'est pas dans le tableau usersDisliked et que like est égal à -1
      // Pouce rouge activé (front-end)
      if (!sauce.usersDisliked.includes(userId) && like === -1) {
        Sauce.updateOne(
          { _id: sauceId },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: userId },
          }
        )
          .then(() => res.status(201).json({ message: "User disLike +1" }))
          .catch((error) => res.status(400).json({ error }));
      }

      // like = 0 pas de vote Si userId est dans le tableau usersDisliked et que like est égal à 0
      // Pouce rouge désactivé (front-end) dislike annulé
      if (sauce.usersDisliked.includes(userId) && like === 0) {
        Sauce.updateOne(
          { _id: sauceId },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: userId },
          }
        )
          .then(() => res.status(201).json({ message: "User disLike +1" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(404).json({ error }));

    */

  // AJOUTER UN LIKE OU UN DISLIKE

  if (like === 1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        //On regarde si l'utilisateur n'a pas déjà liké ou disliké la sauce
        if (
          sauce.usersDisliked.includes(userId) ||
          sauce.usersLiked.includes(userId)
        ) {
          res.status(401).json({ message: "Opération non-autorisée !" });
        } else {
          Sauce.updateOne(
            { _id: sauceId },
            {
              // Insère le userId dans le tableau usersLiked du modèle
              $push: { usersLiked: userId },
              // Ajoute le like
              $inc: { likes: +1 },
            }
          )
            .then(() => res.status(200).json({ message: "Like ajouté !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
  if (like === -1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        // On regarde si l'utilisateur n'a pas déjà liké ou disliké la sauce
        if (
          sauce.usersDisliked.includes(userId) ||
          sauce.usersLiked.includes(userId)
        ) {
          res.status(401).json({ message: "Opération non-autorisée !" });
        } else {
          Sauce.updateOne(
            { _id: sauceId },
            {
              // Insère le userId dans le tableau usersDisliked du modèle
              $push: { usersDisliked: userId },
              // Ajoute le dislike
              $inc: { dislikes: +1 },
            }
          )
            .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }

  // RETIRER SON LIKE OU SON DISLIKE

  if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        // Regarde si le userId est déjà dans le tableau usersliked
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              // Retire le userId dans le tableau usersliked du modèle
              $pull: { usersLiked: userId },
              // Retire le like
              $inc: { likes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: "Like retiré" }))
            .catch((error) => res.status(400).json({ error }));
        }
        // Regarde si le userId est déjà dans le tableau usersDisliked
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              // Retire le userId dans le tableau usersDisliked du modèle
              $pull: { usersDisliked: userId },
              // Retire le dislike
              $inc: { dislikes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: "Dislike retiré !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};
