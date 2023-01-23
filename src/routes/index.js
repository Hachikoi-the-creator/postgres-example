const { Router } = require("express");
const { ContactInfo, User, Tweet, Follow_Join } = require("../db");

const mainRouter = Router();

// ! ADD USER (1:1) - Make and link user & contact info
const userNamesArr = ["Jonny Vegas", "Paco Pacotilla", "Jhon Doe"];

mainRouter.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // * Creating the user
    const userId = await createUserHelper(userNamesArr[id]);
    // * linking the user with a new ContactInfo
    // ? Since sequelize automatically creates the UserId attr I can just pass it directly :'D
    const contactInfo = createContactInfoHelper("12313-1123-123", userId);

    console.log({ userId, contactInfo });
    res.send("All went ok :D\n");
  } catch (error) {
    console.log(error);
  }
});

// ! ADD TWEET (1:N) - adding & linking twits from user 1
const tweetMsgArr = ["I'm so cool", "You are the best", "W will rock you"];

mainRouter.get("/tweet/:twtId/:userId", async (req, res) => {
  const { twtId, userId } = req.params;

  try {
    const userIdWait = await getUserIdHelper(userId);

    await createTweetHelper(tweetMsgArr[twtId], userIdWait);
    res.send("added tw: " + 1 + "\n");
  } catch (error) {
    console.log(error);
    res.send("ERR: " + error.message + "\n");
  }
});

// ! Get user who twitted :'D
mainRouter.get("/twtAll", async (req, res) => {
  try {
    // basics
    // const allTweets = await Tweet.findAll({ include: User });
    // select constraints
    const allTweets = await Tweet.findAll({
      include: { model: User, attributes: { include: ["name", "email"] } },
      attributes: { exclude: ["UserId", "UpdatedAt", "CreatedAt"] },
    });
    // const twtsUsers = allTweets.map((e) => e.User);
    res.json({ msg: "Got all twits like a king", allTweets });
  } catch (error) {
    console.log(error);
    res.send("ERR: " + error.message + "\n");
  }
});

// ! Get User + tweets + contactInfo
mainRouter.get("/allData", async (req, res) => {
  try {
    const allUsers = await User.findAll({
      include: [{ model: Tweet }, { model: ContactInfo }],
      attributes: { exclude: ["UserId", "UpdatedAt", "CreatedAt"] },
    });

    res.send(allUsers);
  } catch (error) {
    console.log(error);
    res.send("ERR: " + error.message + "\n");
  }
});

// ! ADD COMMUNITY (N:M) 0,1,2
const communitiesArr = [
  {
    name: "Cool comm 1",
    summary: "We do some really cool soadjs",
  },
  {
    name: "Cooler comm 2",
    summary: "We do some really cool soadjs",
  },
  {
    name: "Coolest comm 3",
    summary: "We do some really cool soadjs",
  },
];

mainRouter.get("/comm/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userId = await getUserIdHelper();

    await Community.create(communitiesArr[id]);

    res.send("Community added correctly UwU");
  } catch (error) {
    res.send({ msg: "wrong something", error: error.message });
  }
});

// ! Add Follower (N:M)
// need to get 2 users -> invoque the automeatically created addUser method to add as follower
mainRouter.get("/addf/:user/:follow", async (req, res) => {
  const { userId, followId } = req.params;
  try {
    const allUsers = await User.findAll();
    const userFollows = allUsers[userId];
    const toFollowUser = allUsers[followId];

    // makes the relationship in the join table
    await userFollows.addUser(toFollowUser);
    const followsArr = await userFollows.getUser();

    res.send(`All went faboulis ${followsArr} \n`);
  } catch (error) {
    console.log(error);
    res.send("ERR: " + error.message + "\n");
  }
});

// ! Make X User to follow every user
mainRouter.get("/addf/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const allUsers = await User.findAll();
    // const willFollowAll = allUsers[id];
    const willFollowAll = await User.findOne({
      where: { name: userNamesArr[id] },
    });

    // even tho is async we don't need to wait for it
    allUsers.forEach((user) => {
      if (user.id !== willFollowAll.id) willFollowAll.addUser(user);
    });

    res.send("User followed all users OK \n");
  } catch (error) {
    console.log(error);
    res.send("ERR: " + error.message + "\n");
  }
});

// ! Fecth User N:M
mainRouter.get("/fetch", async (req, res) => {
  try {
    const allUsers = await User.findAll({
      include: { model: User, as: "Followed" },
    });

    res.send(allUsers);
  } catch (error) {
    console.log(error);
    res.send("ERR: " + error.message + "\n");
  }
});

module.exports = mainRouter;

// * -------------------
// * HELPER FUNCTIONS
// * -------------------
/**
 * @param {String} name Random user name
 * @returns {UUID} id of the user created
 */
async function createUserHelper(name) {
  const user = await User.create({ name, email: `${name}@gmail.sus` });
  return user.id;
}

/**
 * @param {String} phone Any format of phone number is valid
 * @param {UUID} UserId id of the user that owns this Contact info
 * @returns `ContactInfo` instance created
 */
async function createContactInfoHelper(phone, UserId) {
  const res = await ContactInfo.create({ phone, UserId });
  return res;
}

/**
 * @param {String} title Some random title
 * @param {UUID} UserId id of the user that twitted that tweet
 * @returns Instance of `Tweet` created
 */
async function createTweetHelper(title, UserId) {
  const res = await Tweet.create({
    title,
    UserId,
    desc: `${title}'s cool desc idk`,
  });
  return res;
}

async function getUserIdHelper(index = 0) {
  // pretty weirdge how I need to get the id
  const user = await User.findAll();
  return user[index].id;
}
