const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const db = require("../db");

/* GET home page. */


router.get('/edit/:customersId',(request, response)=>{
  const id = request.params.customersId;
  db.findUser(id)
  .then(customers => response.render("newCustomer", {title: "Edição de usuário",customers}))
  .catch(error => console.log(error));

})

router.get('/new', function(req, res, next) {
  res.render("newCustomer", {title: "cadastro de usuários",  customers:{}});
});

router.post('/new', (request, response)=>{
  if(!request.body.name)
  return response.redirect("/customers/new?error= O campo nome é obrigatório!");
  if(!request.body.cpf )
  return response.redirect("/customers/new?error= O campo idade deve ser um número");
  const id = request.body.id;
  const name= request.body.name;
  const cpf = parseInt(request.body.cpf);
  const city = request.body.city === "Selecione uma opção:"? '' : request.body.city;

  const uf = request.body.uf.length > 2? '' : request.body.uf ;

  const customers = { name, cpf, city, uf };
  const promise = id ? db.updateCustomers(id, customers)
 
                     : db.insertCustomers(customers);
                     console.log(id);
  promise
    .then(result => {
      response.redirect("/customers");
    })
  .catch(error =>{
    return console.log(error);
  })
});

router.get('/:page?', async (req, res, next) => {
  const page = parseInt(req.params.page || 1);
  console.log(page)

  try {
      const qty = await db.countCustomers();
      const pagesQty = Math.ceil(qty / db.PAGE_SIZE);
      const customers = await db.findCustomers(page);
      res.render("customers", { title: "Clientes", customers, qty, pagesQty, page});
      console.log(qty)
  }
  catch (error) {
      console.log(error);
      res.render("error", { message: "Não foi possível listar os clientes", error })
  }
});

module.exports = router;
