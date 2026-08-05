// =============================================================================
//  server.js  —  Vaultly API (Class 7: making data persist)
// =============================================================================
//  Lives in:  vaultly-admin/backend/src/server.js
//
//  SETUP (if not done already):  npm install express cors
//  RUN:                          node server.js   (restart after every edit)
//
//  WHAT'S NEW THIS CLASS:
//      Our transactions used to live only in memory, so they vanished on restart.
//      Now we LOAD them from data.json when the server starts, and SAVE them back
//      whenever they change — so Vaultly remembers.
// =============================================================================


// --- IMPORTS -----------------------------------------------------------------

import express from "express";
import cors from "cors";
import fs from "fs";

// const express = require("express");
// const cors = require("cors");


// fs = "file system". Built into Node (no npm install). Lets us read & write files.
// const fs = require("fs");


// --- APP SETUP ---------------------------------------------------------------

const app = express();

app.use(cors());          // let the React page (a different address) call us
app.use(express.json());  // let the server read incoming JSON


// --- LOAD SAVED DATA (runs once, when the server starts) ----------------------

// Read data.json as text, then turn that text back into a real JavaScript object.
//   fs.readFileSync(...)  -> the file's contents, as text
//   JSON.parse(...)       -> text turned back into an object
// data.json actually looks like: { vaults: [...], transactions: [...], settings: {...} }
// so we keep the whole thing in `data` and work with `data.transactions` below.
let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));


// A small helper: save the current data back to the file.
function saveData() {
  // JSON.stringify(...) turns our object back into text.
  // The  null, 2  part just makes the saved file neatly indented and readable.
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}


// --- TRANSACTION ROUTES ------------------------------------------------------

// GET /transactions  ->  hand back everything we loaded from the file
// (vaults + transactions + settings), same shape data.json is stored in.
app.get("/transactions", (req, res) => {
  res.json(data);
});

app.delete("/transactions/:id", (req, res) => {
  const id = req.params.id; // transaction ids in data.json are strings, e.g. "tx_1"
  data.transactions = data.transactions.filter(
    t => t.id !== id
  );
  saveData();
  res.json(data)
});

// POST /transactions  ->  add a new one AND save, so it survives a restart.
app.post("/transactions", (req, res) => {
  data.transactions.push(req.body);   // add it to the array (in memory)
  saveData();                         // write the object to the file (on disk)
  res.json(data);                     // reply with the updated data
});


// --- LOGIN ROUTE  (unchanged — matches Mark's page) --------------------------

app.post("/api/auth/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.json({ success: false, error: { message: "Please fill in all fields." } });
  }

  if (email === "test@vaultly.com" && password === "1234") {
    return res.json({ success: true });
  }

  return res.json({ success: false, error: { message: "Invalid email or password." } });
});


// --- START THE SERVER --------------------------------------------------------

app.listen(3000, () => {
  console.log("Vaultly API running on http://localhost:3000");
});
