import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { DataSource } from "typeorm";
import { Product } from "./entity/product";
const dataSource = new DataSource({
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
  .then((db) => {
    const productRepo = db.getRepository(Product);

    const app = express();

    app.use(
      cors({
        origin: ["http://localhost:3000"],
      })
    );

    app.use(express.json());

    app.get("/api/products", async (req: Request, res: Response) => {
      console.log("Requsting products");

      const porducts = await productRepo.find();
      res.json(porducts);
    });

    app.post("/api/products", async (req: Request, res: Response) => {
      const product = await productRepo.create(req.body);
      const result = await productRepo.save(product);
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
      res.send(result);
    });

    app.delete("/api/products/:id", async (req: Request, res: Response) => {
      const result = await productRepo.delete(req.params.id);
      return res.send(result);
    });

    app.listen(8000, () => {
      console.log("Listen on Port 8000");
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
