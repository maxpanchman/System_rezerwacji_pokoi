export class Room {#
    creditCardNumber;
    constructor(number, type, isAvailable = true) {
        this.number = number;
        this.type = type;
        this.isAvailable = isAvailable;
        this.#creditCardNumber = null;
    }

    reserve() {
        this.isAvailable = false;
    }

    setCreditCardNumber(number) {
        const numStr = String(number).replace(/\D/g, '');
        if (numStr.length !== 16) {
            throw new Error('Numer karty musi mieć dokładnie 16 cyfr.');
        }
        this.#creditCardNumber = numStr;
    }

    getMaskedCardNumber() {
        if (!this.#creditCardNumber) return null;
        return '**** **** **** ' + this.#creditCardNumber.slice(-4);
    }
}