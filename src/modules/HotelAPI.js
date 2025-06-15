export class HotelAPI {
    static async fetchReviews() {
        const res = await fetch("https://jsonplaceholder.typicode.com/comments?postId=1");
        return await res.json();
    }
}