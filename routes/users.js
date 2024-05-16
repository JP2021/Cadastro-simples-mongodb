const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const db = require("../db");

/* GET home page. */


router.get('/edit/:userId',(request, response)=>{
  const id = request.params.userId;
  db.findUser(id)
  .then(user => response.render("newUser", {title: "Edição de usuário",user}))
  .catch(error => console.log(error));

})

router.get('/delete/:userId', (request, response) => {
  const id = request.params.userId;
  db.deleteUser(id)
      .then(result => response.redirect("/users"))
      .catch(error => {
          console.log(error);
          res.render("error", { message: "Não foi possível excluir o Usuário", error })
      });
})

router.get('/new', function(req, res, next) {
  res.render("newUser", {title: "cadastro de usuários",  user:{}});
});

router.post('/new', (request, response)=>{
  const id = request.body.id;

  if(!request.body.name)
  return response.redirect("/users/new?error= O campo nome é obrigatório!");
  if(!id && !request.body.password )
  return response.redirect("/users/new?error= O campo senha é obrigatório");
  
  const name = request.body.name;
  const email= request.body.email;
  
  const user = { name, email };
  if(request.body.password)
    user.password =  request.body.password  
  
  const promise = id ? db.updateUser(id, user)
 
                     : db.insertUser(user);
                     console.log(id);
  promise
    .then(result => {
      response.redirect("/users");
    })
  .catch(error =>{
    return console.log(error);
  })
});

router.get('/:page?', async (req, res, next) => {
  const page = parseInt(req.params.page || 1);
  console.log(page)

  try {
      const qty = await db.countUsers();
      const pagesQty = Math.ceil(qty / db.PAGE_SIZE);
      const users = await db.findUsers(page);
      res.render("users", { title: "Usuários", users, qty, pagesQty, page});
      console.log(qty)
  }
  catch (error) {
      console.log(error);
      res.render("error", { message: "Não foi possível listar os Usuários", error })
  }
});

module.exports = router;
