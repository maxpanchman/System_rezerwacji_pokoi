import { Hotel } from './modules/Hotel.js';
import { Room } from './modules/Room.js';
import { PremiumRoom } from './modules/PremiumRoom.js';
import { UI } from './modules/UI.js';

const hotel = new Hotel('Hotel Warszawa');
if (hotel.rooms.length === 0) {
    hotel.addRoom(new Room(101, 'single'));
    hotel.addRoom(new Room(102, 'double'));
    hotel.addRoom(new PremiumRoom(201, 'suite', 'Darmowe śniadanie'));
}

const availableRooms = hotel.getAvailableRooms();
UI.showRooms(availableRooms);

// Example reservation and saving to localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Reserve first available room for demo
    if (availableRooms.length > 0) {
        hotel.reserveRoom(availableRooms[0].number);
        UI.showRooms(hotel.getAvailableRooms());
    }
});