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

async function loadReviews(number) {
    try {
        const response = await fetch('http://localhost:3000/reviews');
        const reviews = await response.json();
        const sample = reviews
            .filter(r => r.roomNumber === number)
            .slice(0, 3);

        const reviewsContainer = document.querySelector(`#room-${number} .reviews`);
        reviewsContainer.innerHTML = '';

        sample.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <p class="review-text">${review.body}</p>
                <p class="review-author">${review.email}</p>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

async function addReview() {
    // Get form values
    const email = document.getElementById("reviewEmail").value.trim();
    const roomNumber = parseInt(document.getElementById("reviewRoom").value.trim());
    const body = document.getElementById("reviewBody").value.trim();

    // Validate input
    if (!email || !roomNumber || !body) {
        alert("Please fill in all fields");
        return;
    }

    if (isNaN(roomNumber) || roomNumber < 1) {
        alert("Please enter a valid room number");
        return;
    }

    // Disable submit button
    const submitButton = document.querySelector("#reviewForm button[type='submit']");
    submitButton.disabled = true;

    try {
        // Send review to backend
        const response = await fetch('http://localhost:3000/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                roomNumber,
                body
            })
        });

        if (response.ok) {
            // Clear form
            document.getElementById("reviewEmail").value = '';
            document.getElementById("reviewRoom").value = '';
            document.getElementById("reviewBody").value = '';

            // Show success message
            alert("Review added successfully!");

            // Reload reviews for the room
            loadReviews(roomNumber);
        } else {
            const error = await response.json();
            alert(`Failed to add review: ${error.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error adding review:', error);
        alert('Error adding review. Please try again.');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
    }
}