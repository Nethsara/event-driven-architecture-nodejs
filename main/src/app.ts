import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { DataSource } from "typeorm";
import { Product } from "./entity/product";
import * as ampq from "amqplib/callback_api";
const dataSource = new DataSource({
  type: "mongodb",
  host: "localhost",
  database: "msc_main",
  synchronize: true,
  logging: false,
  entities: ["src/entity/*.js"],
});

dataSource
  .initialize()
  .then((db) => {
    const productRepo = db.getRepository(Product);

    ampq.connect(
      "amqps://lidugtcd:jlskyoit9MTO0ez16EtLCuArVLKtokMy@hawk.rmq.cloudamqp.com/lidugtcd",
      (error0, connection) => {
        if (error0) {
          throw error0;
        }
        connection.createChannel((error1, channel) => {
          if (error1) throw error1;

          const app = express();

          app.use(
            cors({
              origin: ["http://localhost:3000"],
            })
          );

          app.use(express.json());

          app.listen(8001, () => {
            console.log("Listen on Port 8001");
          });
        });
      }
    );
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
