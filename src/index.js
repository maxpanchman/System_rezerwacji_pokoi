import './style.scss';
import { Hotel } from './modules/Hotel.js';
import { Room } from './modules/Room.js';
import { PremiumRoom } from './modules/PremiumRoom.js';
import { UI } from './modules/UI.js';
import { UserManager } from './modules/UserManager.js';

const hotel = new Hotel('Hotel Warszawa');
const userManager = new UserManager();
let currentUser = null;

if (hotel.rooms.length === 0) {
    hotel.addRoom(new Room(101, 'single'));
    hotel.addRoom(new Room(102, 'double'));
    hotel.addRoom(new PremiumRoom(201, 'suite', 'Darmowe śniadanie'));
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

document.addEventListener('DOMContentLoaded', () => {
    updateAuthStatus();
    UI.showRooms(hotel.rooms);
});

// Example reservation and saving to localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Reserve first available room for demo
    if (hotel.rooms.length > 0) {
        hotel.reserveRoom(hotel.rooms[0].number);
        UI.showRooms(hotel.rooms);
    }
});