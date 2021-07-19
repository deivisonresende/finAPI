const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find(customer => customer.cpf === cpf);
  if (!customer) {
    response.status(400).json({
      error: 'Customer not found !'
    });
  }
  request.customer = customer;
  return next();
}

function getBalance(statements) {
  const balance = statements.reduce((acc, operation) => {
    if (operation.type == 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
}

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const costumerAlreadyExists = customers.some(
    costumer => costumer.cpf === cpf
  );
  if (costumerAlreadyExists) {
    response.status(400).json({
      error: 'Costumer already exists'
    });
  }else{ customers.push({
    cpf,
    name,
    id: uuidv4(),
    statements: []
  });}
  return response.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statements);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  };
  customer.statements.push(statementOperation);
  return response.status(201).json(statementOperation);
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statements);

  if (balance < amount) {
    return response.status(400).json({
      error: 'Insufficient funds'
    });
  }
  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  };
  customer.statements.push(statementOperation);
  return response.status(200).send();
});

app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;
  console.log(date);
  const dateFormat = new Date(date + ' 00:00');
  console.log(dateFormat);
  const statement = customer.statements.filter(
    statement =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );
  console.log(statement);
  return response.json(statement);
});

app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;
  console.log(customer.name);
  return response.status(201).send();

});

app.get('/account',verifyIfExistsAccountCPF,(request, response)=>{
  const { customer} = request;
  return response.json(customer)
})

app.delete('/account',verifyIfExistsAccountCPF,(request, response)=>{
  const { customer} = request;
  customers.splice(customer, 1)
  return response.status(200).json(customers)
})

app.get('/balance', verifyIfExistsAccountCPF, (request, response)=>{
  const {customer} = request;

  const balance = getBalance(customer.statements)

  return response.status(200).json(balance)
})

const port = 3333;
app.listen(port, () => console.log(`Server listening on port ${port}`));
