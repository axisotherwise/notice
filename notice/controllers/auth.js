const passport = require("passport");
const bcrypt = require("bcrypt");
const { User } = require("../models");

exports.authJoin = async (req, res, next) => {
  const { email, name, profile, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email }});
    if (exUser) return res.redirect("/?error=이미 가입된 회원입니다.");
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      name,
      profile,
      password: hash,
    });
    res.status(201).redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.authLogin = async (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect("/?error=가입된 회원이 아닙니다.");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.log(loginError);
        return next(loginError);
      }
      return res.redirect("/profile");
    })
  })(req, res, next);
};

exports.authLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid").redirect("/");
  });
};

exports.authKakao = (req, res) => {
  passport.authenticate("kakao");
};

exports.authKakaoCallBack = (req, res, next) => {
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }), (req, res) => {
    res.redirect("/profile");
  };
};