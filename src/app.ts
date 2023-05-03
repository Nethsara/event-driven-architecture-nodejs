import * as express from "express";
import * as cors from "cors";
import { DataSource } from "typeorm";
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
  .then(() => {
    const app = express();

    app.use(
      cors({
        origin: ["http://localhost:3000"],
      })
    );

    app.use(express.json());

    app.listen(8000, () => {
      console.log("Listen on Port 8000");
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
