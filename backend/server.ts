import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Client } from 'pg';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'https://angular-postgre-assignment-frontent.onrender.com',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

app.use(bodyParser.json());

const DB_USER = 'root';
const DB_PASSWORD = '7atx5tzYxSgDdXkiZhGWFEdnlv97QnfQ';
const DB_HOST = 'dpg-cvio36ogjchc73fruuj0-a';
const DB_PORT = 5432;
const DB_NAME = 'postgredb_product';

const connectionString = `postgresql://product_db_22sq_user:syF3q8NZXXOHzfBgiEr0qe8M1FKEpDXL@dpg-cvjdf5ggjchc739bj9b0-a.oregon-postgres.render.com/product_db_22sq`;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

client.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Add Product
app.post('/add-product', async (req: Request, res: Response): Promise<void> => {
  const { name, price, images } = req.body;

  if (!name || !price || !images || !Array.isArray(images)) {
    res.status(400).json({ message: 'Invalid input data' });
    return;
  }

  try {
    const result = await client.query(
      'INSERT INTO products (name, price, images) VALUES ($1, $2, $3) RETURNING *',
      [name, price, images]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get Products
app.get('/get-products', async (req: Request, res: Response) => {
  try {
    const result = await client.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Update Product
app.put('/update-product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, images } = req.body;

  if (!name || !price || !images || !Array.isArray(images)) {
    res.status(400).json({ message: 'Invalid input data' });
    return;
  }

  try {
    await client.query(
      'UPDATE products SET name = $1, price = $2, images = $3 WHERE id = $4',
      [name, price, images, id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete Product
app.delete('/delete-product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
