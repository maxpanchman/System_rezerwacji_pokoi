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

    reserveRoom(number) {
        const room = this.rooms.find(r => r.number === number && r.isAvailable);
        if (room) {
            room.reserve();
            this.saveReservations();
            return true;
        }
        return false;
    }

    saveReservations() {
        const reserved = this.rooms.filter(r => !r.isAvailable).map(r => r.number);
        localStorage.setItem('reservedRooms', JSON.stringify(reserved));
    }

    loadReservations() {
        const reserved = JSON.parse(localStorage.getItem('reservedRooms') || '[]');
        this.rooms.forEach(room => {
            if (reserved.includes(room.number)) {
                room.isAvailable = false;
            }
        });
    }
}