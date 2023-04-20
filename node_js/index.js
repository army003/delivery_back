const { createPool } = require("mysql");
const express = require("express");
const cors = require("cors");
const app = express();

var pool = createPool({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "delivery",
});

app.use(
  cors({
    origin: "http://127.0.0.1:5176",
  })
);
app.use(express.json());

//метод для получения продуктов по категории

app.get("/products/:product_type", (req, result) => {
  switch (req.params["product_type"]) {
    case "food":
      pool.query(
        "SELECT * FROM product JOIN product_class on product.class_id=product_class.id where product_class.class_name = 'food';",
        (err, res) => result.json(res)
      );
      break;
  }
});

// метод для создания заказа
app.post("/create-order", (req, res) => {
  const item = req.body;
  const sql = "INSERT INTO delivery SET ?";

  pool.query(sql, item, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Item created");
  });
});

//метод для авторизации курьера
app.post("/auth", (req, res) => {
  const { phone_number, password } = req.body;

  const sql = `SELECT access_token FROM deliveryman WHERE phone_number = ? AND password = ?`;
  pool.query(sql, [phone_number, password], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      res.send({ access_token: result[0].access_token });
    } else {
      res.status(401);
      res.send({ error: "Incorrect phone number or password" });
    }
  });
});

//метод для обновления статуса заказа
app.patch("/change-status", (req, res) => {
  const { delivery_status, id } = req.body;
  const sql = `UPDATE delivery SET delivery_status = ? WHERE id = ?`;
  pool.query(sql, [delivery_status, id], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      res.send("Status changed");
    }
  });
});
//метод для отображения заказов

app.listen(3000, () => {
  console.log(`Server is running on port 8000.`);
});

// const jwt = require("jsonwebtoken");

// const payload = {
//   id: 123,
//   username: "john_doe",
//   email: "john_doe@example.com",
// };

// const secret = "my_secret_key";

// const token = jwt.sign(payload, secret);

// console.log(token);
