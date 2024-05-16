
const express = require('express');
const router = express.Router();
const db = require("../db");
const { findUser } = require('../auth');

/* GET home page. */
router.get('/', function(req, res, next) {
 
      res.render("login", {title: "Login", message:""});    
   
    });

    router.post("/login", async (req, res, next)=> { 
      const name = req.body.name;
      const user = await findUser(name);
     
      if(!user) return res.render("Login", {title:"Login", message: "Usuário ou senha inválidos"});     
      const password = req.body.password;
     
      if(user.password!== password) return res.render("Login", {title:"Login", message:"Usuário ou senha inválidos"});

      res.redirect("/index")

   } )


module.exports = router;