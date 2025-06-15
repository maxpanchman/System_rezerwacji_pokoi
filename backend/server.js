import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { nanoid } from 'nanoid';
import db from './db.js';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware для перевірки авторизації
const checkAuth = (req, res, next) => {
    console.log('Checking auth headers:', req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No Bearer token found');
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Invalid token format');
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    console.log('Looking for user with token:', token);
    const user = db.data.users.find(u => u.token === token);
    if (!user) {
        console.log('No user found with this token');
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    console.log('User found:', user.username);
    req.user = user;
    next();
};

// Реєстрація
app.post('/register', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (db.data.users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = nanoid();

    const user = {
        id: nanoid(),
        username,
        password: hashedPassword,
        token
    };

    db.data.users.push(user);
    await db.write();

    res.json({ token, username });
});

// Логін
app.post('/login', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.data.users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ token: user.token, username: user.username });
});

// Отримання відгуків
app.get('/reviews', (req, res) => {
    const { roomNumber } = req.query;
    let reviews = db.data.reviews;

    if (roomNumber) {
        reviews = reviews.filter(review => review.roomNumber === parseInt(roomNumber));
    }

    res.json(reviews);
});

// Отримання конкретного відгуку
app.get('/reviews/:id', (req, res) => {
    const review = db.data.reviews.find(r => r.id === req.params.id);
    if (!review) {
        return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
});

// Редагування відгуку
app.put('/reviews/:id', checkAuth, async(req, res) => {
    const { id } = req.params;
    const { email, roomNumber, body } = req.body;

    if (!email || !roomNumber || !body) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const reviewIndex = db.data.reviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }

    // Перевіряємо, чи користувач є автором відгуку
    if (db.data.reviews[reviewIndex].username !== req.user.username) {
        return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    const updatedReview = {
        ...db.data.reviews[reviewIndex],
        email,
        roomNumber: parseInt(roomNumber),
        body,
        updatedAt: new Date().toISOString()
    };

    db.data.reviews[reviewIndex] = updatedReview;
    await db.write();

    res.json(updatedReview);
});

// Додавання відгуку (тільки для авторизованих)
app.post('/reviews', checkAuth, (req, res) => {
    const { roomNumber, rating, comment } = req.body;

    if (!roomNumber || !rating || !comment) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const review = {
        id: nanoid(),
        roomNumber: parseInt(roomNumber),
        rating: parseInt(rating),
        comment,
        username: req.user.username,
        date: new Date().toISOString()
    };

    db.data.reviews.push(review);
    db.write();

    res.json(review);
});

(async() => {
    await db.read();
    if (!db.data) db.data = { reviews: [], users: [] };
    await db.write();

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();