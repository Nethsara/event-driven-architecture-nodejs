"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var app = express();
app.use(cors({
    origin: ["http://localhost:3000"],
}));
app.use(express.json());
app.listen(8000, function () {
    console.log("Listen on Port 8000");
});
