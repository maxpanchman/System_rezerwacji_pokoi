import { User } from '../modules/User.js';

export class UserManager {
    // ... existing code ...

    login(username, password) {
        const user = this.users.find(u => u.username === username);
        if (user && user.validatePassword(password)) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user.toJSON()));
            return user;
        }
        throw new Error('Nieprawidłowy login lub hasło!');
    }

    // ... existing code ...
}