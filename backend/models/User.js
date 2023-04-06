// Importation des packages mongoose et mongoose unique validator
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Utilisation de la méthode "Schema" de "Mongoose" qui contient tous les champs souhaités et leur type
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Plugin qui empêche deux utilisateurs d'avoir la même adresse email
userSchema.plugin(uniqueValidator);

// Exportation du Schema pour le rendre disponible pour l'application "Express"
module.exports = mongoose.model("User", userSchema);
