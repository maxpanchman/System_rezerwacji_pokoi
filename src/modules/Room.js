export class Room {
    constructor(number, type, isAvailable = true) {
        this.number = number;
        this.type = type;
        this.isAvailable = isAvailable;
    }

    reserve() {
        this.isAvailable = false;
    }
}