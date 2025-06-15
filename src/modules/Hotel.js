import { Room } from './Room.js';
import { PremiumRoom } from './PremiumRoom.js';

export class Hotel {
    constructor(name) {
        this.name = name;
        this.rooms = [];
        this.loadReservations();
    }

    addRoom(room) {
        this.rooms.push(room);
    }

    getAvailableRooms() {
        return this.rooms.filter(room => room.isAvailable);
    }

    reserveRoom(number, bookedBy) {
        const room = this.rooms.find(r => r.number === number && r.isAvailable);
        if (room) {
            room.reserve();
            room.bookedBy = bookedBy;
            this.saveReservations();
            return true;
        }
        return false;
    }

    saveReservations() {
        const reserved = this.rooms.filter(r => !r.isAvailable).map(r => ({
            number: r.number,
            bookedBy: r.bookedBy || null
        }));
        localStorage.setItem('reservedRooms', JSON.stringify(reserved));
    }

    loadReservations() {
        const reserved = JSON.parse(localStorage.getItem('reservedRooms') || '[]');
        this.rooms.forEach(room => {
            const found = reserved.find(r => r.number === room.number);
            if (found) {
                room.isAvailable = false;
                room.bookedBy = found.bookedBy;
            }
        });
    }
}