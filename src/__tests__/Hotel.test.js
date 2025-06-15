import { Room } from '../modules/Room.js';
import { Hotel } from '../modules/Hotel.js';

beforeEach(() => {
    global.localStorage = {
        data: {},
        getItem(key) {
            return this.data[key] || null;
        },
        setItem(key, value) {
            this.data[key] = value;
        },
        clear() {
            this.data = {};
        }
    };
});

test('getAvailableRooms() returns only available rooms', () => {
    const hotel = new Hotel('Test Hotel');
    const room = new Room(101, 'standard');
    hotel.addRoom(room);
    room.reserve();
    const available = hotel.getAvailableRooms();
    expect(available.length).toBe(0);
});

test('saveReservations() and loadReservations() work with localStorage', () => {
    const hotel1 = new Hotel('Test Hotel');
    const room1 = new Room(101, 'standard');
    const room2 = new Room(102, 'suite');
    hotel1.addRoom(room1);
    hotel1.addRoom(room2);
    room1.reserve();
    hotel1.saveReservations();

    // Now create a new hotel and add the same rooms
    const hotel2 = new Hotel('Test Hotel');
    hotel2.addRoom(new Room(101, 'standard'));
    hotel2.addRoom(new Room(102, 'suite'));
    hotel2.loadReservations();

    expect(hotel2.rooms[0].isAvailable).toBe(false);
    expect(hotel2.rooms[1].isAvailable).toBe(true);
});