import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Pool, PoolClient, PoolConfig } from 'pg';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const poolConfig: PoolConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'Product',
  password: 'root',
  port: 5432,
};
const pool = new Pool(poolConfig);

pool.connect(
  (
    err: Error | undefined,
    client: PoolClient | undefined,
    done: (release?: any) => void
  ) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to PostgreSQL database');
    }
    done();
  }
);

// For adding prodduct
app.post('/add-product', async (req: Request, res: Response): Promise<void> => {
  const { name, price, images } = req.body;

  if (!name || !price || !images || !Array.isArray(images)) {
    res.status(400).json({ message: 'Invalid input data' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, images) VALUES ($1, $2, $3) RETURNING *',
      [name, price, images]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error' });
  }
});

// For getting all Products
app.get('/get-products', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// For updating the product with id
app.put('/update-product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, images } = req.body;

  try {
    await pool.query(
      'UPDATE products SET name = $1, price = $2, images = $3 WHERE id = $4',
      [name, price, images, id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// For deleting the product
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product is deleted, refresh the page" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
