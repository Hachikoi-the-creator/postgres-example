const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// postgres - username:psw@host:port/dbName
const sequelize = new Sequelize(
  "postgres://postgres:easy100@localhost:5432/postgres",
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  }
);

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { ContactInfo, Tweet, User, Community } = sequelize.models;

// Relationships <3
// * 1:1 - User:ContactInfo
// ? How to decide who would have the FK? Chech who cannot live/wouldnt make sence to exist without the other, that needs the FK
User.hasOne(ContactInfo);
ContactInfo.belongsTo(User);

// * 1:N - User:Tweet
User.hasMany(Tweet);
Tweet.belongsTo(User);

// * N:M - User:Community
// User.belongsToMany(Community, { through: "User_Community", timestamps: false });
// Community.belongsToMany(User, { through: "User_Community", timestamps: false });
// ? Example of an user following several users, and a user being able to be followed by a bunch of users
// follows Y person
User.belongsToMany(User, {
  through: "Follow_Join",
  as: "User",
  foreignKey: "UserId",
  timestamps: false,
});
// is being followed by X person
User.belongsToMany(User, {
  through: "Follow_Join",
  as: "Followed",
  foreignKey: "FollowedId",
  timestamps: false,
});

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
