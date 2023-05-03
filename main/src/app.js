"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var product_1 = require("./entity/product");
var ampq = require("amqplib/callback_api");
var dataSource = new typeorm_1.DataSource({
    type: "mongodb",
    host: "localhost",
    database: "msc_main",
    synchronize: true,
    logging: false,
    entities: ["src/entity/*.js"],
});
dataSource
    .initialize()
    .then(function (db) {
    var productRepo = db.getRepository(product_1.Product);
    ampq.connect("amqps://lidugtcd:jlskyoit9MTO0ez16EtLCuArVLKtokMy@hawk.rmq.cloudamqp.com/lidugtcd", function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1)
                throw error1;
            channel.assertQueue("hello", { durable: false });
            var app = express();
            app.use(cors({
                origin: ["http://localhost:3000"],
            }));
            app.use(express.json());
            channel.consume("hello", function (msg) {
                console.log(msg.content.toString());
            });
            app.listen(8001, function () {
                console.log("Listen on Port 8001");
            });
        });
    });
})
    .catch(function (err) {
    console.error("Error during Data Source initialization", err);
});
