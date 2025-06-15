import { HotelAPI } from './HotelAPI.js';

export class UI {
    static showRooms(rooms, currentUser) {
        const old = document.getElementById('roomsContainer');
        if (old) old.remove();
        let logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.remove();
        if (currentUser) {
            logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = window.logoutUser;
            document.getElementById('auth').appendChild(logoutBtn);
        }
        const container = document.createElement('div');
        container.id = 'roomsContainer';
        rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room';
            if (!room.isAvailable) roomDiv.classList.add('booked');
            if (room.premiumService) roomDiv.classList.add('premium-room');
            const bookedBy = room.bookedBy ? `<p><strong>Booked by:</strong> ${room.bookedBy}</p>` : "";
            roomDiv.innerHTML = `Pokój nr ${room.number}, typ: ${room.type}, dostępny: ${room.isAvailable}${bookedBy}`;
            // Przycisk rezerwacji
            const reserveBtn = document.createElement('button');
            reserveBtn.textContent = 'Rezerwuj';
            reserveBtn.disabled = !currentUser || !room.isAvailable;
            reserveBtn.onclick = () => window.bookRoom(room);
            roomDiv.appendChild(reserveBtn);
            // Przycisk anulowania rezerwacji
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.disabled = !(currentUser && room.bookedBy === currentUser.username);
            cancelBtn.onclick = () => window.cancelRoom(room);
            roomDiv.appendChild(cancelBtn);
            // Przycisk opinii
            const reviewsBtn = document.createElement('button');
            reviewsBtn.textContent = 'Load Reviews';
            reviewsBtn.onclick = async() => {
                try {
                    const reviews = await HotelAPI.fetchReviews();
                    const random = reviews.sort(() => 0.5 - Math.random()).slice(0, 3);
                    let reviewsHtml = '<ul>' + random.map(r => `<li>${r.body}</li>`).join('') + '</ul>';
                    let reviewsDiv = roomDiv.querySelector('.reviews');
                    if (!reviewsDiv) {
                        reviewsDiv = document.createElement('div');
                        reviewsDiv.className = 'reviews';
                        roomDiv.appendChild(reviewsDiv);
                    }
                    reviewsDiv.innerHTML = reviewsHtml;
                } catch (e) {
                    alert('Błąd podczas pobierania opinii!');
                }
            };
            roomDiv.appendChild(reviewsBtn);
            container.appendChild(roomDiv);
        });
        document.body.appendChild(container);
    }

    static refreshRooms(rooms, currentUser) {
        this.showRooms(rooms, currentUser);
    }
}