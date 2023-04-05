// Importation du packages mongoose
const mongoose = require("mongoose");

// Utilisation de la méthode "Schema" de "Mongoose" qui contient tous les champs souhaités et leur type
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, min: 1, max: 10, required: true },
  likes: { type: Number, default: 0, required: true },
  dislikes: { type: Number, default: 0, required: true },
  usersLiked: { type: [String], required: true },
  usersDisliked: { type: [String], required: true },
});

// Exportation du Schema pour le rendre disponible pour l'application "Express"
module.exports = mongoose.model("Sauce", sauceSchema);
