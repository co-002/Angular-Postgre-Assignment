"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const poolConfig = {
    user: "root",
    host: process.env.HOST,
    database: "postgredb_product",
    password: process.env.PASSWORD,
    port: Number("5432"),
    ssl: { rejectUnauthorized: false },
};
const pool = new pg_1.Pool(poolConfig);
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    }
    else {
        console.log('Connected to PostgreSQL database');
    }
    done();
});
// Add Product
app.post('/add-product', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, images } = req.body;
    if (!name || !price || !images || !Array.isArray(images)) {
        res.status(400).json({ message: 'Invalid input data' });
        return;
    }
    try {
        const result = yield pool.query('INSERT INTO products (name, price, images) VALUES ($1, $2, $3) RETURNING *', [name, price, images]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Database error' });
    }
}));
// Get Products
app.get('/get-products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query('SELECT * FROM products');
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}));
// Update Product
app.put('/update-product/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, price, images } = req.body;
    try {
        yield pool.query('UPDATE products SET name = $1, price = $2, images = $3 WHERE id = $4', [name, price, images, id]);
        res.json({ message: 'Product updated successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
}));
// Delete Product
app.delete('/delete-product/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
