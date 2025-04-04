// Update Date and Time
document.addEventListener("DOMContentLoaded", function () {
    const now = new Date();
    document.getElementById("news-date").textContent = now.toLocaleDateString();
    document.getElementById("news-time").textContent = now.toLocaleTimeString();
});

// Image Slider Functionality
let slideIndex = 0;
const slides = document.querySelector(".slides");
const dots = document.querySelectorAll(".dot");

function moveToSlide(index) {
    slideIndex = index;
    slides.style.transform = `translateX(${-index * 100}%)`;

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

// Auto-recommend News (Example Data)
const recommendedNews = [
    { title: "US and Allies Strengthen Indo-Pacific Defense", url: "us-defense.html" },
    { title: "Philippines Accuses China of Maritime Aggression", url: "philippines-maritime.html" },
    { title: "China's Global Influence Expanding Rapidly", url: "china-influence.html" }
];

const newsList = document.getElementById("news-recommendations");
recommendedNews.forEach(news => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a href="${news.url}">${news.title}</a>`;
    newsList.appendChild(listItem);
});
