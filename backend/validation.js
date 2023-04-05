// Importation du package joi
const Joi = require("joi");

// Vérification et validation des données provenant du formulaire Signup et Login
const userValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(
        new RegExp(
          "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9])[^\\\\='\"\\s<>]{8,32}$"
        )
      )
      .required()
      .messages({
        "string.base": `"password" should be a type of "text"`,
        "string.pattern.base": `"password" must satisfy the below conditions:
        1. Should have more than 8 and less than 32 characters 
        2. Min 1 uppercase letter 
        3. Min 1 lowercase letter
        4. Min 1 number
        5. Min 1 special character except [\\ > " = ' <]`,
        "any.required": `"password" is a required field`,
      }),
  });
  return schema.validate(data);
};

module.exports.userValidation = userValidation;
