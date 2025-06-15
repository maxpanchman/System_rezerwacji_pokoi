export class User {#
    password;
    constructor(username, password) {
        this.username = username;
        this.setPassword(password);
    }

    setPassword(password) {
        if (typeof password !== 'string' || password.length < 6) {
            throw new Error('Hasło musi mieć co najmniej 6 znaków.');
        }
        this.#password = password;
    }

    validatePassword(password) {
        return this.#password === password;
    }

    toJSON() {
        return {
            username: this.username,
            password: this.#password
        };
    }
}