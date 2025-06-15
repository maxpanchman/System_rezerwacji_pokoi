import { Room } from './Room.js';

export class PremiumRoom extends Room {
    constructor(number, type, premiumService = 'Darmowe śniadanie', isAvailable = true) {
        super(number, type, isAvailable);
        this.premiumService = premiumService;
    }
}