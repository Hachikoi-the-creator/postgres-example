const server = require("./src/app.js");
const { conn } = require("./src/db.js");

const PORT = 6969;

// { alter: true }
// { force: true }
conn.sync({ alter: true }).then(() => {
  server.listen(PORT, () => {
    console.log(`-listening on localhost:${PORT} >~<`);
  });
});
