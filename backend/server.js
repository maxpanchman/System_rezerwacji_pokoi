import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Add CSP headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self' data:; " +
        "connect-src 'self'"
    );
    next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handle favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

const adapter = new JSONFile("db.json");
const db = new Low(adapter, { reviews: [] });

// GET endpoint for reviews
app.get("/reviews", async(req, res) => {
    await db.read();
    res.json(db.data.reviews);
});

// POST endpoint for adding new reviews
app.post("/reviews", async(req, res) => {
    const { roomNumber, email, body } = req.body;
    const newReview = {
        id: nanoid(),
        roomNumber,
        email,
        body,
    };
    await db.read();
    db.data.reviews.push(newReview);
    await db.write();
    res.json({ message: "Review added.", review: newReview });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});