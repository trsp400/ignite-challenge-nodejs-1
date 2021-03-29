const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (userExists) return next();

  return response.status(400).json({
    error: "User does not exists",
  });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists)
    return response.status(400).send({
      error: "User already exists",
    });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  return response
    .status(200)
    .json(users.filter((user) => user.username === username)[0].todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const currentUser = users.filter((user) => user.username === username);

  currentUser[0].todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const currentUser = users.filter((user) => user.username === username)[0];
  const todoExists = currentUser.todos.filter((todo) => todo.id === id)[0];

  if (!todoExists)
    return response.status(404).json({
      error: "Todo does not exists",
    });

  todoExists.title = title;
  todoExists.deadline = deadline;

  return response.status(200).json(todoExists);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const currentUser = users.filter((user) => user.username === username)[0];
  const todoExists = currentUser.todos.filter((todo) => todo.id === id)[0];

  if (!todoExists)
    return response.status(404).json({
      error: "Todo does not exists",
    });

  todoExists.done = true;

  return response.status(200).json(todoExists);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const currentUser = users.filter((user) => user.username === username)[0];

  const todoIndex = currentUser.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo does not exists",
    });

  currentUser.todos.splice(todoIndex, 1);

  users.filter((user) => user.username === username)[0].todos =
    currentUser.todos;

  return response.status(204).json();
});

module.exports = app;
