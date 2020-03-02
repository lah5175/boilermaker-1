const router = require("express").Router();
const User = require("../db/models/user");
module.exports = router;

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      res.status(404).send("User not found!");
    } else if (!user.correctPassword(req.body.password)) {
      res.status(401).json("Incorrect password!");
    } else {
      req.login(user, err => {
        if (err) next(err);
        else res.json(user);
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    console.log(user);
    req.login(user, err => {
      if (err) next(err);
      else res.json(user);
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

router.get("/me", (req, res) => {
  res.json(req.user);
});

router.use("/google", require("./google"));
