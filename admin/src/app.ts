import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { DataSource } from "typeorm";
import { Product } from "./entity/product";
import * as ampq from "amqplib/callback_api";

const dataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "msc_admin",
  entities: ["src/entity/*.js"],
  logging: false,
  synchronize: true,
});

dataSource
  .initialize()
  .then((db) => {
    ampq.connect(
      "amqps://lidugtcd:jlskyoit9MTO0ez16EtLCuArVLKtokMy@hawk.rmq.cloudamqp.com/lidugtcd",
      (error0, connection) => {
        if (error0) {
          throw error0;
        }
        connection.createChannel((error1, channel) => {
          if (error1) throw error1;
          const productRepo = db.getRepository(Product);

          const app = express();

          app.use(
            cors({
              origin: ["http://localhost:3000"],
            })
          );

          app.use(express.json());

          app.get("/api/products", async (req: Request, res: Response) => {
            const porducts = await productRepo.find();
            res.json(porducts);
          });

          app.post("/api/products", async (req: Request, res: Response) => {
            const product = await productRepo.create(req.body);
            const result = await productRepo.save(product);
            channel.sendToQueue(
              "product_created",
              Buffer.from(JSON.stringify(result))
            );

            return res.send(result);
          });

          app.get("/api/products/:id", async (req: Request, res: Response) => {
            console.log(req.params.id);

            const product = await productRepo.findOne({
              where: { id: parseInt(req.params.id, 10) },
            });
            return res.send(product);
          });

          app.put("/api/products/:id", async (req: Request, res: Response) => {
            const product = await productRepo.findOne({
              where: { id: parseInt(req.params.id, 10) },
            });
            productRepo.merge(product, req.body);
            const result = await productRepo.save(product);
            channel.sendToQueue(
              "product_updated",
              Buffer.from(JSON.stringify(result))
            );
            res.send(result);
          });

          app.delete(
            "/api/products/:id",
            async (req: Request, res: Response) => {
              const result = await productRepo.delete(req.params.id);
              channel.sendToQueue(
                "product_deleted",
                Buffer.from(JSON.stringify(req.params.id))
              );
              return res.send(result);
            }
          );

          app.post(
            "/api/products/:id/like",
            async (req: Request, res: Response) => {
              const product = await productRepo.findOne({
                where: { id: parseInt(req.params.id, 10) },
              });
              product.likes++;
              const result = await productRepo.save(product);
              return res.send(result);
            }
          );

          app.listen(8000, () => {
            console.log("Listen on Port 8000");
          });
          process.on("beforeExit", () => {
            console.log("Clossing ");
            connection.close();
          });
        });
      }
    );
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
