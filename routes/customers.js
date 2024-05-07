const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const db = require("../db");

/* GET home page. */
router.get('/', function(req, res, next) {
  db.findUsers()
    .then(users => {
      res.render("customers", {title: "Clientes", users});
      console.log(users);
    })
    .catch(error => {
      console.log(error);
      res.render("error", {message: "Não foi possível listar os clientes"})
    });
});

router.get('/edit/:usersId',(request, response)=>{
  const id = request.params.usersId;
  db.findUser(id)
  .then(users => response.render("newCustomer", {title: "Edição de usuário",users}))
  .catch(error => console.log(error));

})

router.get('/new', function(req, res, next) {
  res.render("newCustomer", {title: "cadastro de usuários",  users:{}});
});

router.post('/new', (request, response)=>{
  if(!request.body.name)
  return response.redirect("/customers/new?error= O campo nome é obrigatório!");
  if(!request.body.age && !/[0-9]+/.test(request.body.age))
  return response.redirect("/customers/new?error= O campo idade deve ser um número");
  const id = request.body.id;
  const name= request.body.name;
  const age = parseInt(request.body.age);
  const city = request.body.city === "Selecione uma opção:"? '' : request.body.city;

  const uf = request.body.uf.length > 2? '' : request.body.uf ;

  const users = { name, age, city, uf };
  const promise = id ? db.updateUsers(id, users)
 
                     : db.insertUsers(users);
                     console.log(id);
  promise
    .then(result => {
      response.redirect("/customers");
    })
  .catch(error =>{
    return console.log(error);
  })
});

router.get('/delete/:userId', (request, response)=>{
  const id = request.params.userId;
  db.deleteUsers(id)
  .then(result => response.redirect("/customers"))
  .catch(error => console.log(error));
})

module.exports = router;
