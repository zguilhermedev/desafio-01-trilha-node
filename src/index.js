const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if(!user) {
    return response.status(404).send({error: 'User not found.'});
  }
  request.user = user;
  return next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if(!todo) {
    return response.status(404).send({error: 'Todo not found.'});
  }
  request.todo = todo;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyCreated = users.some((user) => user.username === username);

  if(userAlreadyCreated) {
    return response.status(400).send({error: 'User already created.'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const { user } = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {title, deadline} = request.body;
  const { user, todo } = request;
  todo.title = title;
  todo.deadline = deadline;
  user.todos.push(todo);
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request;
  todo.done = true;
  user.todos.push(todo);
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request;
  user.todos.splice(todo, 1);
  return response.status(204).json(user.todos);
});

module.exports = app;