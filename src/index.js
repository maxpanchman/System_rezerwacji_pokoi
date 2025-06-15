import './style.scss';
import { Hotel } from './modules/Hotel.js';
import { Room } from './modules/Room.js';
import { PremiumRoom } from './modules/PremiumRoom.js';
import { UI } from './services/UI.js';
import { UserManager } from './services/UserManager.js';

const hotel = new Hotel('Hotel Warszawa');
const userManager = new UserManager();
let currentUser = null;

if (hotel.rooms.length === 0) {
    hotel.addRoom(new Room(101, 'single'));
    hotel.addRoom(new Room(102, 'double'));
    hotel.addRoom(new PremiumRoom(201, 'suite', 'Darmowe śniadanie'));
}

const savedUser = sessionStorage.getItem('loggedInUser');
if (savedUser) {
    currentUser = userManager.users.find(u => u.username === JSON.parse(savedUser).username);
}

window.registerUser = function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const user = userManager.register(username, password);
        currentUser = user;
        updateAuthStatus();
        alert('Zarejestrowano!');
    } catch (e) {
        alert(e.message);
    }
};

window.loginUser = function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const user = userManager.login(username, password);
        currentUser = user;
        updateAuthStatus();
        alert('Zalogowano!');
    } catch (e) {
        alert(e.message);
    }
};

function updateAuthStatus() {
    document.getElementById('authStatus').textContent = currentUser ?
        `Zalogowany jako: ${currentUser.username}` :
        'Nie zalogowano';
}

window.bookRoom = function(room) {
    if (!currentUser) {
        alert('Musisz być zalogowany, aby zarezerwować pokój!');
        return;
    }
    try {
        const card = prompt('Podaj numer karty kredytowej (16 cyfr):');
        room.setCreditCardNumber(card);
        room.reserve();
        room.bookedBy = currentUser.username;
        hotel.saveReservations();
        alert('Zarezerwowano! Karta: ' + room.getMaskedCardNumber() + '\nBooked by: ' + room.bookedBy);
        UI.refreshRooms(hotel.rooms);
    } catch (e) {
        alert(e.message);
    }
};

window.logoutUser = function() {
    sessionStorage.removeItem('loggedInUser');
    currentUser = null;
    updateAuthStatus();
    UI.refreshRooms(hotel.rooms, currentUser);
};

window.cancelRoom = function(room) {
    if (!currentUser || room.bookedBy !== currentUser.username) {
        alert('Możesz anulować tylko swoją rezerwację!');
        return;
    }
    room.isAvailable = true;
    room.bookedBy = null;
    hotel.saveReservations();
    UI.refreshRooms(hotel.rooms, currentUser);
};

document.addEventListener('DOMContentLoaded', () => {
    updateAuthStatus();
    UI.showRooms(hotel.rooms, currentUser);
});

// Example reservation and saving to localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Reserve first available room for demo
    if (hotel.rooms.length > 0) {
        hotel.reserveRoom(hotel.rooms[0].number);
        UI.showRooms(hotel.rooms);
    }
});

async function loadReviews(roomNumber) {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`http://localhost:3000/reviews${roomNumber ? `?roomNumber=${roomNumber}` : ''}`, {
            headers
        });
        
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }
        
        const reviews = await response.json();
        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <h4>Room ${review.roomNumber}</h4>
                <p>Rating: ${review.rating}/5</p>
                <p>${review.comment}</p>
                <small>By ${review.username} on ${new Date(review.date).toLocaleDateString()}</small>
                ${token ? `<button onclick="editReview('${review.id}')">Edit</button>` : ''}
            `;
            reviewsList.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

async function editReview(id) {
    try {
        // Get current review data
        const response = await fetch(`http://localhost:3000/reviews/${id}`);
        if (!response.ok) {
            throw new Error('Review not found');
        }
        const review = await response.json();

        // Get new data from user
        const email = prompt('Enter new email:', review.email);
        if (!email) return;

        const roomNumber = prompt('Enter new room number:', review.roomNumber);
        if (!roomNumber) return;

        const body = prompt('Enter new review text:', review.body);
        if (!body) return;

        // Validate input
        if (!email.trim() || !body.trim()) {
            alert('Email and review text cannot be empty');
            return;
        }

        const roomNumberInt = parseInt(roomNumber);
        if (isNaN(roomNumberInt) || roomNumberInt < 1) {
            alert('Please enter a valid room number');
            return;
        }

        // Send update request
        const updateResponse = await fetch(`http://localhost:3000/reviews/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.trim(),
                roomNumber: roomNumberInt,
                body: body.trim()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update review');
        }

        alert('Review updated successfully!');
        loadReviews(roomNumberInt);
    } catch (error) {
        console.error('Error updating review:', error);
        alert(error.message || 'Error updating review');
    }
}

async function addReview(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    console.log('Current token when adding review:', token);
    
    if (!token) {
        alert('Please log in to add a review');
        return;
    }
    
    const roomNumber = document.getElementById('review-room').value;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;
    
    try {
        console.log('Sending review with headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        
        const response = await fetch('http://localhost:3000/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomNumber, rating, comment })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add review');
        }
        
        document.getElementById('review-form').reset();
        loadReviews();
    } catch (error) {
        console.error('Error adding review:', error);
        alert(error.message);
    }
}

window.addReview = addReview;

// Функція для реєстрації
async function register(username, password) {
    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Функція для логіну
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        
        const data = await response.json();
        console.log('Login successful, token:', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        
        const savedToken = localStorage.getItem('token');
        console.log('Saved token:', savedToken);
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Функція для виходу
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateAuthUI();
}

// Оновлення UI в залежності від стану авторизації
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const reviewForm = document.getElementById('review-form');
    
    if (token) {
        authSection.style.display = 'none';
        userSection.style.display = 'block';
        reviewForm.style.display = 'block';
        document.getElementById('current-user').textContent = username;
    } else {
        authSection.style.display = 'block';
        userSection.style.display = 'none';
        reviewForm.style.display = 'none';
    }
}

// Додаємо обробники подій для форм
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await register(username, password);
        updateAuthUI();
        document.getElementById('register-form').reset();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await login(username, password);
        updateAuthUI();
        document.getElementById('login-form').reset();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
    updateAuthUI();
});

// Ініціалізуємо UI при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadReviews();
});