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
  cors()
  // {
  //   origin: "http://127.0.0.1:5173",
  // }
);
app.use(express.json());

//метод для получения suppliers
app.get("/suppliers", (req, result) => {
  const params = req.query;
  let sql = `SELECT * FROM supplier join ${params.supplier_type} on supplier.id=${params.supplier_type}.supplier_id `;
  pool.query(sql, (err, res) => result.json(res));
});

//метод для отображения заказов
app.get("/orders", (req, result) => {
  const sql = "SELECT * FROM delivery";
  pool.query(sql, (err, res) => result.json(res));
});

//метод для получения продуктов по категории

app.get("/products", (req, result) => {
  const params = req.query;
  pool.query(
    `SELECT * FROM product WHERE supplier_id=${params.supplier_id} `,
    (err, res) => result.json(res)
  );
});

app.get("/product", (req, result) => {
  const params = req.query;
  const sql = `SELECT product.id,product_class.class_name,product.price,supplier.title,product.supplier_id,supplier.address,supplier.number,supplier.supplier_type,product.name  FROM product_class JOIN product on product.class_id=product_class.id join supplier on product.supplier_id=supplier.id where product.id=${params.id}`;
  pool.query(sql, (err, res) => result.json({ data: res }));
});

// метод для создания заказа
app.post("/create-order", (req, res) => {
  const item = req.body;
  const sql = "INSERT INTO delivery SET ?";

  pool.query(sql, item, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.status(200);
    res.send({ data: null });
  });
});

//метод для создания пользователя
app.post("/create-customer", (req, res) => {
  // Extract the name, address, and number fields from the request body
  const { name, address, number } = req.body;

  // Define the SQL query string and parameters
  const sql = "INSERT INTO customer (name, address, number) VALUES (?, ?, ?)";
  const values = [name, address, number];

  // Get a connection from the connection pool
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle error
      console.error(`Failed to get MySQL connection: ${err}`);
      res.status(500).send("Internal server error");
    } else {
      // Execute the SQL query with the provided parameters
      connection.query(sql, values, (err, result) => {
        // Release the connection back to the pool
        connection.release();

        if (err) {
          // Handle error
          console.error(`Failed to insert customer: ${err}`);
          res.status(500).send("Internal server error");
        } else {
          // Return the ID of the newly created row
          res.status(201).json({ id: result.insertId });
        }
      });
    }
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
  const sql = "UPDATE delivery SET delivery_status = ? WHERE id = ?";
  pool.query(sql, [delivery_status, id], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200);
      console.log(result);
      res.send("Status updated");
    }
  });
});

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
