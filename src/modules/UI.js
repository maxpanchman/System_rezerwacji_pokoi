export class UI {
    static showRooms(rooms) {
        rooms.forEach(room => {
            console.log(`Pokój nr ${room.number}, typ: ${room.type}, dostępny: ${room.isAvailable}`);
        });
    }
}