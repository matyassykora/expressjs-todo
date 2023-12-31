const express = require('express');
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuid } = require('uuid');
const createError = require('http-errors');
const port = process.env.PORT || 3000;
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'expressjs-todo-db',
  password: '1234',
})

let todos = [];

const addTodo = async (todo) => {
  const text = 'INSERT INTO todos(id, name, done) VALUES ($1, $2, $3)';
  const values = [
    todo.id,
    todo.name,
    todo.done
  ]
  return await pool.query(text, values);
}

const getTodosByState = async (done) => {
  const res = await pool.query('SELECT id, name, done FROM todos where done = $1::boolean ORDER BY userorder', [done]);
  return res.rows;
}

const getAllTodos = async () => {
  const res = await pool.query('SELECT * FROM todos ORDER BY userorder');
  return res.rows;
}

// TODO: this works but it updates the whole table...
// maybe OK for a simple todo list ?
// using the 3rd approach from https://begriffs.com/posts/2018-03-20-user-defined-order.html or similar is better
const changeTodoOrder = async (order, id) => {
  const text = 'UPDATE todos SET userorder = $1 WHERE id = $2';
  const values = [order, id];
  return await pool.query(text, values);
}

const deleteTodo = async (id) => {
  const text = 'DELETE FROM todos WHERE id = $1';
  const values = [id];
  return await pool.query(text, values);
}

const deleteCompletedTodos = async () => {
  const res = await pool.query('DELETE FROM todos WHERE done = true');
  return res.rows;
}

const updateTodo = async (id, name) => {
  const text = 'UPDATE todos SET name = $1 WHERE id = $2';
  const values = [name, id];
  return await pool.query(text, values);
}

const toggleTodo = async (id) => {
  const text = 'UPDATE todos SET done = NOT done WHERE id = $1';
  const values = [id];
  return await pool.query(text, values);
}

const getItemsLeft = async () => {
  const res = await pool.query('SELECT count(*) FROM todos where done = false');
  return res.rows[0].count
}

const app = express();
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let filter;

app.get('/', async (req, res) => {
  todos = await getAllTodos();
  filter = req.query.filter;
  let filteredTodos = [];
  switch (filter) {
    case 'all':
      filteredTodos = todos;
      break;
    case 'active':
      filteredTodos = await getTodosByState(false);
      break;
    case 'completed':
      filteredTodos = await getTodosByState(true);
      break;
    default:
      filteredTodos = todos;
  }

  res.render('index', {
    todos: filteredTodos,
    filter,
    itemsLeft: await getItemsLeft()
  });
});

app.post('/todos', async (req, res) => {
  const { todo } = req.body;
  const newTodo = {
    id: uuid(),
    name: todo,
    done: false
  };
  todos.push(newTodo);
  await addTodo(newTodo);
  const url = req.get('HX-Current-URL');
  const slug = url.split('=').pop();
  if (slug == 'completed') {
    let template = pug.compileFile('views/includes/item-count.pug');
    let markup = template({ itemsLeft: await getItemsLeft() });
    res.send(markup);
    return;
  }
  let template = pug.compileFile('views/includes/todo-item.pug');
  let markup = template({ todo: newTodo });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: await getItemsLeft() });
  res.send(markup);
});

app.post('/todos/reorder', async (req, res) => {
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
    newTodos.push(newTodo);
    changeTodoOrder(i, newTodo.id);
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

app.patch('/todos/:id', async (req, res) => {
  const id = req.params.id;
  await toggleTodo(id);
  const todo = todos.find(t => t.id === id);
  todo.done = !todo.done;
  let template = pug.compileFile('views/includes/todo-item.pug');
  let markup = template({ todo });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: await getItemsLeft() });
  res.send(markup);
});

app.post('/todos/update/:id', async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const todo = todos.find(t => t.id === id);
  todo.name = name;
  await updateTodo(id, name);
  let template = pug.compileFile('views/includes/todo-item.pug');
  let markup = template({ todo });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: await getItemsLeft() });
  res.send(markup);
});

app.delete('/todos/:id', async (req, res) => {
  await deleteTodo(req.params.id);
  const id = req.params.id;
  var filteredArray = todos.filter(e => e.id !== id)
  todos = filteredArray
  const template = pug.compileFile('views/includes/item-count.pug');
  const markup = template({ itemsLeft: await getItemsLeft() });
  res.send(markup);
});

app.post('/todos/clear-completed', async (req, res) => {
  const url = req.get('HX-Current-URL');
  const slug = url.split('=').pop();
  const newTodos = todos.filter(t => !t.done);
  deleteCompletedTodos();
  todos = [...newTodos];
  if (slug == 'completed') {
    let template = pug.compileFile('views/includes/item-count.pug');
    let markup = template({ itemsLeft: await getItemsLeft() });
    res.send(markup);
    return;
  }
  let template = pug.compileFile('views/includes/todo-list.pug');
  let markup = template({ todos });
  template = pug.compileFile('views/includes/item-count.pug');
  markup += template({ itemsLeft: await getItemsLeft() });
  res.send(markup);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
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
