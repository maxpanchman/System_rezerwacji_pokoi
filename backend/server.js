import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import cors from 'cors';
import bodyParser from 'body-parser';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const adapter = new JSONFile('db.json');
const db = new Low(adapter, { reviews: [], users: [] });

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

// Реєстрація користувача
app.post('/signup', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    await db.read();

    // Перевірка чи користувач вже існує
    const existingUser = db.data.users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Хешування паролю
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Створення нового користувача
    const newUser = {
        id: nanoid(),
        username,
        password: hashedPassword
    };

    db.data.users.push(newUser);
    await db.write();

    res.status(201).json({ message: 'User registered successfully' });
});

// Логін користувача
app.post('/login', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    await db.read();

    // Пошук користувача
    const user = db.data.users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Перевірка паролю
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Генерація токену
    const token = nanoid();
    user.token = token;
    await db.write();

    res.json({
        message: 'Login successful',
        username: user.username,
        token
    });
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

// Usuwanie recenzji
app.delete('/reviews/:id', async(req, res) => {
    const { id } = req.params;
    await db.read();
    const index = db.data.reviews.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Review not found.' });
    }
    db.data.reviews.splice(index, 1);
    await db.write();
    res.json({ message: 'Review deleted.' });
});

(async() => {
    await db.read();
    if (!db.data) db.data = { reviews: [], users: [] };
    await db.write();

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();