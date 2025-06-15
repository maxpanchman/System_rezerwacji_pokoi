import { Room } from '../modules/Room.js';

test('booking a room sets isAvailable to false', () => {
    const room = new Room(101, 'standard');
    room.reserve();
    expect(room.isAvailable).toBe(false);
});

test('cancelBooking sets isAvailable to true', () => {
    const room = new Room(102, 'standard');
    room.reserve();
    expect(room.isAvailable).toBe(false);
    room.cancelBooking();
    expect(room.isAvailable).toBe(true);
});