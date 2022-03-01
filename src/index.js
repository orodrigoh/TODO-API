const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers

  const user = users.find(user => user.username === username);

  if(!user) return response.status(404).send({error: "User not found"})

  request.user= user;

  return next();
}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if(userExists) {
    response.status(400).send({error: "Username already exists"})

  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);
  response.status(201).send(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  response.status(201).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)
  response.status(201).send(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const { title, deadline } = request.body;

 const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    response.status(404).send({error: "Todo not found"})

  }

    todo.title = title;
    todo.deadline = new Date(deadline);


  response.status(201).send(todo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    response.status(404).send({error: "Todo not found"})

  }
  todo.done = true;


  response.status(201).send(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    response.status(404).send({error: "Todo not found"})
  }
  
  user.todos.splice(user.todos.indexOf(todo) ,1)

  response.status(204).send()
});

module.exports = app;