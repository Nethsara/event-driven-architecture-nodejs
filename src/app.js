"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var dataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "msc_admin",
    entities: ["src/entity/*.js"],
    logging: true,
    synchronize: true,
});
dataSource
    .initialize()
    .then(function () {
    var app = express();
    app.use(cors({
        origin: ["http://localhost:3000"],
    }));
    app.use(express.json());
    app.listen(8000, function () {
        console.log("Listen on Port 8000");
    });
})
    .catch(function (err) {
    console.error("Error during Data Source initialization", err);
});
