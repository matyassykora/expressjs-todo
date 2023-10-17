const express = require('express');
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuid } = require('uuid');
const createError = require('http-errors');
const port = process.env.PORT || 3000;

let todos = [
  {
    id: uuid(),
    name: 'walk the dog',
    done: true,
  },
  {
    id: uuid(),
    name: 'buy something',
    done: false,
  },
  {
    id: uuid(),
    name: "a thing to do",
    done: false,
  },
  {
    id: uuid(),
    name: "another thing to do",
    done: true,
  },
];

const getItemsLeft = () => todos.filter(t => !t.done).length;

const app = express();
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  const { filter } = req.query;
  let filteredTodos = [];
  switch (filter) {
    case 'all':
      filteredTodos = todos;
      break;
    case 'active':
      filteredTodos = todos.filter(t => !t.done);
      break;
    case 'completed':
      filteredTodos = todos.filter(t => t.done);
      break;
    default:
      filteredTodos = todos;
  }

  res.render('index', {
    todos: filteredTodos,
    filter,
    itemsLeft: getItemsLeft()
  });
});

app.post('/todos', (req, res) => {
  const { todo } = req.body;
  const newTodo = {
    id: uuid(),
    name: todo,
    done: false
  };
  todos.push(newTodo);
  let template = pug.compileFile('views/includes/todo-item.pug');
  let markup = template({ todo: newTodo });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

// TODO: fix reordering while in 'active' filter deleting items
// it's disabled for now
/* 
idea:  maybe keep a different list of todos for each filter mode and 
then sync when swapping?
*/
app.post('/todos/reorder', (req, res) => {
  var { ids } = req.body
  var { names } = req.body
  var { completed } = req.body
  const amount = todos.length
  let newTodos = []
  for (let i = 0; i < amount; i++) {
    var newTodo = {
      id: ids[i],
      name: names[i],
      done: completed[i] == "true"
    };
    newTodos.push(newTodo)
  }

  const filteredArray = newTodos.filter(value => !todos.includes(value));
  let arr = []
  for (let index = 0; index < filteredArray.length; index++) {
    const element = filteredArray[index];
    if (element.id != undefined) {
      arr.push(element)
    }
  }
  //console.log(todos, filteredArray, arr);
  if (arr.length == todos.length) {
    todos = newTodos
  }
  else {

  }

  let template = pug.compileFile('views/includes/todo-list.pug');
  let markup = template({ todos });
  res.send(markup);
})

app.get('/todos/edit/:id', (req, res) => {
  const id = req.params.id;
  const todo = todos.find(t => t.id === id);
  let template = pug.compileFile('views/includes/edit-item.pug');
  let markup = template({ todo });
  res.send(markup);
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const todo = todos.find(t => t.id === id);
  todo.done = !todo.done;
  let template = pug.compileFile('views/includes/todo-item.pug');
  let markup = template({ todo });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.post('/todos/update/:id', (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const todo = todos.find(t => t.id === id);
  todo.name = name;
  let template = pug.compileFile('views/includes/todo-item.pug');
  let markup = template({ todo });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  var filteredArray = todos.filter(e => e.id !== id)
  todos = filteredArray
  const template = pug.compileFile('views/includes/item-count.pug');
  const markup = template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.post('/todos/clear-completed', (req, res) => {
  const newTodos = todos.filter(t => !t.done);
  todos = [...newTodos];
  let template = pug.compileFile('views/includes/todo-list.pug');
  let markup = template({ todos });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`Listening on: http://127.0.0.1:${port}`);
});
