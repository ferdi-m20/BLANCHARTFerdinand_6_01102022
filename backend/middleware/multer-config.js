// Importation du package multer permettant de gérer les fichiers entrants dans les requêtes HTTP
const multer = require("multer");
// const path = require("path");

// PERMET DE RECUPERER LE FORMAT D'UNE IMAGE
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// RENOMME ET ENREGISTRE L'IMAGE DANS LE DOSSIER "IMAGES"

/* Nous créons une constante storage, à passer à multer comme configuration, 
   qui contient la logique nécessaire pour indiquer à multer où enregistrer les fichiers entrants. */
const storage = multer.diskStorage({
  // La méthode diskStorage() configure le chemin et le nom de fichier pour les fichiers entrants
  destination: (req, file, callback) => {
    callback(null, "images");
    console.log(file);
  },
  /* La fonction filename indique à multer de créer une fonction JS permettant de générer une String aléatoire 
     et d'ajouter un timestamp Date.now() comme nom de fichier. 
     Elle utilise ensuite la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée. */
  filename: (req, file, callback) => {
    const name = Math.random().toString(36).slice(2, 10);
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// S'assurer que l'user envoi bien un fichier image
const fileFilter = (req, file, callback) => {
  // On vérifie le mime type du fichier
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else
    callback(
      new Error("Only .jpg, .jpeg, .png and .webp format allowed!"),
      false
    );
};

module.exports = multer({ storage: storage, fileFilter: fileFilter }).single(
  "image"
);

/* Nous exportons ensuite l'élément multer entièrement configuré, en lui passant notre constante storage
et en lui indiquant que nous gérerons uniquement les téléchargements de fichiers image. */

/* La méthode single() crée un middleware qui capture les fichiers d'un certain type (passé en argument),
et les enregistre au système de fichiers du serveur à l'aide du storage configuré. */

/* Pour pouvoir appliquer notre middleware à nos routes stuff, nous devrons les modifier quelque peu,
car la structure des données entrantes n'est pas tout à fait la même avec des fichiers et des données JSON. */
