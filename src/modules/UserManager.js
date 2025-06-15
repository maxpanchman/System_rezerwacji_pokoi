import { User } from './User.js';

export class UserManager {
    constructor() {
        this.users = [];
        this.loadUsers();
    }

    register(username, password) {
        if (this.users.find(u => u.username === username)) {
            throw new Error('Użytkownik już istnieje!');
        }
        const user = new User(username, password);
        this.users.push(user);
        this.saveUsers();
        return user;
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username);
        if (user && user.validatePassword(password)) {
            return user;
        }
        throw new Error('Nieprawidłowy login lub hasło!');
    }

    saveUsers() {
        const data = this.users.map(u => u.toJSON());
        localStorage.setItem('users', JSON.stringify(data));
    }

    loadUsers() {
        const data = JSON.parse(localStorage.getItem('users') || '[]');
        this.users = data.map(u => new User(u.username, u.password));
    }
}