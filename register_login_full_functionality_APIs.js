######################################################   APP.js ########################################33



const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

let db = null;

//************************  Initializing DB  ***********************************

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("************  Server Started  ***************")
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
initializeDbAndServer();

// ************************  POST register a new user ********************************

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;

  const query = `select * from user where username = '${username}';`;

  const res = await db.get(query);

  if (res === undefined) {
    const length = password.length;
    if (length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const bcryptHash = await bcrypt.hash(password, 10);

      const query = `insert into user 
            (username,name,password,gender,location) values 
            ('${username}','${name}','${bcryptHash}',
            '${gender}','${location}');`;

      await db.run(query);

      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//  *********************  LOGIN checking post ***********************************

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const databaseUser = await db.get(selectUserQuery);

  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const query = `SELECT * FROM user WHERE username = '${username}';`;
  const res = await db.get(query);

  if (res !== undefined) {
    const comp = await bcrypt.compare(oldPassword, res.password);

    if (comp === true) {
      if (newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const newHashed = await bcrypt.hash(newPassword, 10);
        const query = `update user set 
                password = '${newHashed}' 
                where username = '${username}';`;
        await db.run(query);
        response.status(200);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;





#################################################################       hi.http #################################################3




###

POST http://localhost:3000/register
Content-Type: application/json

{
  "username": "adam_richard",
  "name": "Adam Richard",
  "password": "richard_567",
  "gender": "male",
  "location": "Detroit"
}

###
POST http://localhost:3000/login
Content-Length: application/json

{
  "username": "adam_richard",
  "password": "richard_567"
}


###
PUT http://localhost:3000/change-password

{
  "username": "adam_richard",
  "oldPassword": "richard_567",
  "newPassword": "richard@123"
}














