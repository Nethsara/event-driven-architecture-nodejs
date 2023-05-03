import * as express from "express";
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

          channel.assertQueue("product_created", { durable: false });
          channel.assertQueue("product_updated", { durable: false });
          channel.assertQueue("product_deleted", { durable: false });

          const app = express();

          app.use(
            cors({
              origin: ["http://localhost:3000"],
            })
          );

          app.use(express.json());

          channel.consume(
            "product_created",
            async (msg) => {
              const eventProduct: Product = JSON.parse(msg.content.toString());
              const product = new Product();
              product.admin_id = parseInt(eventProduct.id);
              product.title = parseInt(eventProduct.title);
              product.image = parseInt(eventProduct.image);
              product.likes = parseInt(eventProduct.likes);
              await productRepo.save(product);
              console.log("Product Created");
            },
            { noAck: true }
          );

          channel.consume(
            "product_updated",
            async (msg) => {
              const eventProduct: Product = JSON.parse(msg.content.toString());
              const product = await productRepo.findOne({
                where: { admin_id: parseInt(eventProduct.id, 10) },
              });
              productRepo.merge(product, {
                title: eventProduct.title,
                image: eventProduct.image,
                likes: eventProduct.likes,
              });
              await productRepo.save(product);
              console.log("Product Updated");
            },
            { noAck: true }
          );

          channel.consume(
            "product_deleted",
            async (msg) => {
              const admin_id = msg.content.toString();
              await productRepo.delete({ admin_id });
              console.log("Product deleted");
            },
            { noAck: true }
          );

          app.listen(8001, () => {
            console.log("Listen on Port 8001");
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
