export class Room {
    _creditCardNumber;
    constructor(number, type, isAvailable = true) {
        this.number = number;
        this.type = type;
        this.isAvailable = isAvailable;
        this._creditCardNumber = null;
    }

    reserve() {
        this.isAvailable = false;
    }

    setCreditCardNumber(number) {
        const numStr = String(number).replace(/\D/g, '');
        if (numStr.length !== 16) {
            throw new Error('Numer karty musi mieć dokładnie 16 cyfr.');
        }
        this._creditCardNumber = numStr;
    }

    getMaskedCardNumber() {
        if (!this._creditCardNumber) return null;
        return '**** **** **** ' + this._creditCardNumber.slice(-4);
    }

    cancelBooking() {
        this.isAvailable = true;
    }
}