###############################################################        APP.js      ##############################################



const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());

const pat = path.join(__dirname, "cricketMatchDetails.db");

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

//  ******************* 1  GET All the Players  ****************************

app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM player_details;`;
  const responseDB = await db.all(query);

  response.send(
    responseDB.map((each) => ({
      playerId: each.player_id,
      playerName: each.player_name,
    }))
  );
});

//*******************  2  GET a Player *************************************

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM player_details WHERE
   player_id = '${playerId}';`;

  const responseDB = await db.get(query);
  response.send({
    playerId: responseDB.player_id,
    playerName: responseDB.player_name,
  });
});

// ****************** 3  PUT a player with ID *****************************

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query = `UPDATE player_details SET 
    player_name ='${playerName}'
    WHERE player_id = '${playerId}';`;

  const responseDB = await db.run(query);

  response.send("Player Details Updated");
});

// ******************** 4  GET a match of ID  ******************************

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `SELECT * FROM match_details
     WHERE match_id = '${matchId}';`;

  const responseDB = await db.get(query);
  response.send({
    matchId: responseDB.match_id,
    match: responseDB.match,
    year: responseDB.year,
  });
});

// ******************* 5  GET a player all Matches  *************************

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * from player_match_score 
    natural join match_details 
    where player_id ='${playerId}';`;

  const responseDB = await db.all(query);
  response.send(
    responseDB.map((each) => {
      return {
        matchId: each.match_id,
        match: each.match,
        year: each.year,
      };
    })
  );
});

// ***************** 6  GET All players in a match *************************

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const query = `SELECT * from player_match_score 
  natural join player_details
    where match_id = '${matchId}'; `;

  const responseDB = await db.all(query);
  response.send(
    responseDB.map((each) => {
      return {
        playerId: each.player_id,
        playerName: each.player_name,
      };
    })
  );
});

//  ******************* 7  GET tol scores of a Player **********************

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT player_details.player_id as playerId ,
  player_details.player_name as playerName,
  sum(score) as totalScore,sum(fours) as totalFours,
  sum(sixes) as totalSixes 
  from player_match_score natural join
    player_details 
     where player_id = '${playerId}';`;

  const responseDB = await db.get(query);
  response.send(responseDB);
});

module.exports = app;











###############################################################  App.http   ############################################################333






GET http://localhost:3000/players/

###
GET http://localhost:3000/players/2/


###
PUT http://localhost:3000/players/2/
Content-Type: application/json

{
  "playerName": "Raju"
}

###

GET http://localhost:3000/matches/3/


###
GET http://localhost:3000/players/8/matches/

###
GET http://localhost:3000/matches/2/players/

###
GET http://localhost:3000/players/4/playerScores/

