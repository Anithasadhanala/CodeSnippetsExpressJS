const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());
const pat = path.join(__dirname, "todoApplication.db");

// ******************** Initializing DB ****************************************

let db = null;
const initializingDB = async () => {
  try {
    db = await open({
      filename: pat,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("*************** Server started *******************");
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initializingDB();

// **********************   GET all users based on TODO Query *********************

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  if (priority !== undefined && priority === "HIGH") {
    const query = `select * from todo
         where priority = '${priority}';`;

    const responseDB = await db.all(query);
    response.send(responseDB);
  } else if (status !== undefined && status === "TO DO") {
    const query = `select * from 
        todo where status = '${status}' ;`;

    const responseDB = await db.all(query);
    response.send(responseDB);
  } else if (
    priority !== undefined &&
    status !== undefined &&
    status === "IN PROGRESS" &&
    priority === "HIGH"
  ) {
    const query = `select * from todo where 
          priority = '${priority}' and status = '${status}' ;`;

    const responseDB = await db.all(query);
    response.send(responseDB);
  } else if (search_q === "Play") {
    const query = ` SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
    const responseDB = await db.all(query);
    response.send(responseDB);
  }
});

// *****************  GET todo From the ID ****************************************************

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `select * from todo where id='${todoId}';`;
  const responseDB = await db.get(query);
  response.send(responseDB);
});

//********************  POST a new todo  *************************************************

app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const query = `insert into todo (id,todo,status,priority)
     values('${id}','${todo}','${status}','${priority}');`;

  const responseDB = await db.run(query);
  response.send("Todo Successfully Added");
});

// **************************    PUT the details ******************************************

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (status !== undefined) {
    const query = `update todo set status 
         = '${status}' where id='${todoId}';`;
    const responseDB = await db.run(query);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const query = `update todo set priority 
         = '${priority}' where id='${todoId}';`;
    const responseDB = await db.run(query);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const query = `update todo set todo 
         = '${todo}' where id='${todoId}';`;
    const responseDB = await db.run(query);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", (request, response) => {
  const { todoId } = request.params;
  const query = `delete from todo where id = '${todoId}';`;
  const responseDB = db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
