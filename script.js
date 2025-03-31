// Auto-refresh Breaking News Ticker
document.addEventListener("DOMContentLoaded", function () {
    const ticker = document.querySelector(".breaking-news marquee");
    ticker.innerHTML = "Breaking News: New Updates Every Minute! Stay Tuned ";
});
document.getElementById('contact-link').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent the default link behavior
    const footer = document.getElementById('footer');
    
    // Scroll smoothly to the footer
    footer.scrollIntoView({
        behavior: 'smooth'  // Smooth scroll to footer
    });
});
let lastScrollTop = 0; // Variable to keep track of the last scroll position
const header = document.querySelector('header');
const navBar = document.querySelector('.nav-bar');

window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > lastScrollTop) {
        // Scrolling down
        header.style.top = '-60px';  // Move header up
        navBar.style.top = '-60px';  // Move nav-bar up (hidden)
    } else {
        // Scrolling up
        header.style.top = '0';      // Bring header back down
        navBar.style.top = '60px';   // Bring nav-bar back below the header
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll
});
// NEWSLETTER FORM SUBMISSION
document.getElementById("newsletter-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    alert("Thank you for subscribing! Updates will be sent to " + email);
    document.getElementById("email").value = "";
});
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior
        const sectionId = this.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Weather App Fix
const apiKey = "3fcd1d33745f573bf4ae7d9f58f7e85a";
let hourlyChartInstance = null;
let dailyChartInstance = null;

const capitalCities = {
    "USA": "Washington",
    "United States": "Washington",
    "India": "New Delhi",
    "Japan": "Tokyo",
    "France": "Paris",
    "Germany": "Berlin",
    "UK": "London",
    "United Kingdom": "London",
    "Canada": "Ottawa",
    "Australia": "Canberra",
    "Russia": "Moscow",
    "China": "Beijing",
    "Brazil": "Brasilia",
    "South Korea": "Seoul",
    "Italy": "Rome",
    "Spain": "Madrid"
};

async function getWeather(cityOrCountry = null, lat = null, lon = null) {
    let apiUrl;
    if (!cityOrCountry && lat === null && lon === null) {
        cityOrCountry = document.getElementById("city").value.trim();
    }

    if (!cityOrCountry && lat === null && lon === null) {
        alert("Please enter a city or country name.");
        return;
    }

    if (capitalCities[cityOrCountry]) {
        cityOrCountry = capitalCities[cityOrCountry];
    }

    apiUrl = lat !== null && lon !== null
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        : `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCountry}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("Location not found!");
            return;
        }

        document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
        document.getElementById("temperature").innerText = data.main.temp;
        document.getElementById("feels_like").innerText = data.main.feels_like;
        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("wind").innerText = data.wind.speed;
        document.getElementById("pressure").innerText = data.main.pressure;
        document.getElementById("sunrise").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        document.getElementById("sunset").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById("description").innerText = data.weather[0].description;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        await getAirQuality(data.coord.lat, data.coord.lon);
        await getUVIndex(data.coord.lat, data.coord.lon);
        await getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        document.getElementById("aqi").innerText = data.list[0].main.aqi;
    } catch (error) {
        console.error("Error fetching AQI:", error);
    }
}

async function getUVIndex(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        document.getElementById("uv").innerText = data.value;
    } catch (error) {
        console.error("Error fetching UV Index:", error);
    }
}

async function getForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        const labels = data.list.map(item => new Date(item.dt * 1000).toLocaleTimeString());
        const temps = data.list.map(item => item.main.temp);

        updateChart("hourlyChart", labels.slice(0, 8), temps.slice(0, 8), "24-Hour Forecast");
        updateChart("dailyChart", labels.filter((_, i) => i % 8 === 0), temps.filter((_, i) => i % 8 === 0), "5-Day Forecast");
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

function updateChart(canvasId, labels, data, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (canvasId === "hourlyChart" && hourlyChartInstance) hourlyChartInstance.destroy();
    if (canvasId === "dailyChart" && dailyChartInstance) dailyChartInstance.destroy();

    const chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: "#ff9800",
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    if (canvasId === "hourlyChart") hourlyChartInstance = chartInstance;
    if (canvasId === "dailyChart") dailyChartInstance = chartInstance;
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => getWeather(null, position.coords.latitude, position.coords.longitude),
            () => getWeather("Delhi")
        );
    } else {
        getWeather("Delhi");
    }
}

// mail submission 
document.getElementById("newsletter-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents page reload
    let emailInput = document.getElementById("email");
    let email = emailInput.value.trim();
    let errorMessage = document.getElementById("email-error");
    let errorText = document.getElementById("error-text");

    // Email validation
    if (email === "") {
        errorText.textContent = "Please re try at Home page";
        errorMessage.style.display = "flex";
        emailInput.style.border = "1px solid rgb(86, 255, 77)";
    } else if (!email.includes("@")) {
        errorText.textContent = "Invalid email! '@' is missing.";
        errorMessage.style.display = "flex";
        emailInput.style.border = "1px solid #ff4d4d";
    } else if (!email.includes(".")) {
        errorText.textContent = "Please enter a valid email (example@mail.com).";
        errorMessage.style.display = "flex";
        emailInput.style.border = "1px solid #ff4d4d";
    } else {
        errorMessage.style.display = "none"; // Hide error message
        emailInput.style.border = "1px solid #444"; // Reset border
        
        // Simulate subscription success
        alert("✅Subscribed successfully: " + email);
        emailInput.value = ""; // Clear input
    }
});

// mode 
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const themeIcon = document.getElementById("theme-icon");

    if (localStorage.getItem("theme") === "dark") {
        enableDarkMode();
    } else {
        enableLightMode();
    }

    window.toggleTheme = function () {
        if (body.classList.contains("dark-mode")) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    };

    function enableLightMode() {
        body.classList.remove("dark-mode");
        themeIcon.textContent = "dark_mode";

        document.querySelectorAll("*").forEach(el => {
            const style = window.getComputedStyle(el);
            const bgColor = rgbToHex(style.backgroundColor);
            const textColor = rgbToHex(style.color);

            // 🎨 **Light Mode Colors (RGBA)**
            const lightModeColors = {
                background: "rgba(248, 249, 250, 1)",
                h5Bg: " #ff4d71"    ,
                headerBg: "rgba(252, 252, 252, 0.95)",    
                headerText: "rgba(34, 34, 34, 1)",
                navBg: "rgba(242, 242, 242, 0.95)",     
                navText: "rgba(51, 51, 51, 1)",
                sidebarBg: "rgba(245, 245, 245, 1)",
                sidebarText: "rgb(38, 38, 38)",
                footerBg: "rgba(237, 237, 237, 1)",
                footerText: "rgba(17, 17, 17, 1)",
                headingText: "rgba(34, 34, 34, 1)",
                paragraphText: "rgba(51, 51, 51, 1)",
                linkText: "rgba(0, 123, 255, 1)",
                cardBg: "rgba(239, 239, 239, 0.95)",    
                cardText: "rgba(34, 34, 34, 1)",
                inputBg: "rgba(255, 255, 255, 1)",
                inputText: "rgba(34, 34, 34, 1)",
                inputBorder: "rgba(208, 208, 208, 1)",
                buttonBg: "rgba(240, 106, 40, 0.94)",
                buttonText: "rgba(255, 255, 255, 1)",
                iconColor: "rgba(34, 34, 34, 1)",
                overlayBg: "rgba(0, 0, 0, 0.1)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)"
            };

            // **Set Comfortable Background Instead of Plain White**
            if (bgColor !== "transparent" && isDark(bgColor)) {
                el.style.backgroundColor = lightModeColors.background;
            }

         
            
            // **Cards & Boxes with Depth**
            if (el.classList.contains("news-card") || el.classList.contains("weather-box")) {
                el.style.backgroundColor = lightModeColors.cardBg;
                el.style.boxShadow = lightModeColors.boxShadow;
                el.style.borderRadius = "10px";
            }

            // **Fix Email Icon & Breaking News Runner Visibility**
            if (el.classList.contains("email-icon")) {
                el.style.color = lightModeColors.iconColor;
            }

            // **Make Text More Readable**
            if (el.tagName.startsWith("H")) {
                el.style.color = lightModeColors.headingText;
            } else if (textColor === "#ffffff") {
                el.style.color = lightModeColors.paragraphText;
            }

            // **Inputs & Forms**
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.style.backgroundColor = lightModeColors.inputBg;
                el.style.color = lightModeColors.inputText;
                el.style.border = `1px solid ${lightModeColors.inputBorder}`;
            }

            // **Fix Placeholder Color for Email Fields**
            if (el.tagName === "INPUT" && el.type === "email") {
                el.style.color = lightModeColors.inputText;
                el.style.border = `1px solid ${lightModeColors.inputBorder}`;
                el.placeholder = el.placeholder;
                el.style.opacity = "1";
            }

            // **Buttons**
            if (el.tagName === "BUTTON") {
                el.style.backgroundColor = lightModeColors.buttonBg;
                el.style.color = lightModeColors.buttonText;
            }

            // **Footer**
            if (el.tagName === "FOOTER") {
                el.style.backgroundColor = lightModeColors.footerBg;
                el.style.color = lightModeColors.footerText;
            }
        });

        localStorage.setItem("theme", "light");
    }

    function enableDarkMode() {
        body.classList.add("dark-mode");
        themeIcon.textContent = "light_mode";

        document.querySelectorAll("*").forEach(el => {
            el.style.backgroundColor = "";
            el.style.color = "";
            el.style.backgroundImage = "";
            el.style.boxShadow = "";
        });

        localStorage.setItem("theme", "dark");
    }

    // 🔍 **Check if Color is Dark**
    function isDark(hex) {
        if (!hex.startsWith("#")) return false;
        const [r, g, b] = hexToRgb(hex);
        return (r + g + b) / 3 < 80;
    }

    // 🎨 **Convert RGB to HEX**
    function rgbToHex(rgb) {
        if (!rgb.includes("rgb")) return rgb.toLowerCase();
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    // 🎨 **Convert HEX to RGB**
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
});

document.addEventListener("click", function (e) {
    // Ensure clicks are detected everywhere
    if (e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.tagName === "INPUT") return;

    for (let i = 0; i < 10; i++) { // Creates multiple shapes
        const shape = document.createElement("div");
        shape.className = "magic-shape";

        const x = e.clientX + (Math.random() * 60 - 30);
        const y = e.clientY + (Math.random() * 60 - 30);

        const size = Math.random() * 15 + 5;
        const rotate = Math.random() * 360;

        shape.style.position = "fixed"; // Makes sure it stays on top
        shape.style.left = `${x}px`;
        shape.style.top = `${y}px`;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.transform = `rotate(${rotate}deg)`;

        // Random color selection
        const lightColors = ["#ff4757", "#1e90ff", "#2ed573", "#fffa65", "#e84393"];
        const darkColors = ["#ff6b81", "#74b9ff", "#55efc4", "#fdcb6e", "#a29bfe"];
        const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        shape.style.backgroundColor = isDarkMode ? darkColors[Math.floor(Math.random() * darkColors.length)] : lightColors[Math.floor(Math.random() * lightColors.length)];

        // Random shape selection
        const shapes = ["star", "circle", "heart", "diamond"];
        shape.dataset.shape = shapes[Math.floor(Math.random() * shapes.length)];

        document.body.appendChild(shape);

        setTimeout(() => {
            shape.remove();
        }, 1200);
    }
});
//  translation 
document.addEventListener("DOMContentLoaded", async function () {
    const languageSelect = document.getElementById("language");

    // Load saved language from localStorage (if available)
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
        languageSelect.value = savedLanguage;
        await translatePage(savedLanguage);
    }

    // Event listener for language change
    languageSelect.addEventListener("change", async function () {
        let targetLang = this.value;
        localStorage.setItem("selectedLanguage", targetLang); // Save selection
        await translatePage(targetLang);
    });

    async function translatePage(targetLang) {
        let elements = document.querySelectorAll("[data-translate], .translatable");

        let texts = [];
        let elementMap = new Map();

        elements.forEach((el, index) => {
            if (!el.dataset.originalText) {
                el.dataset.originalText = el.textContent.trim(); // Store original text
            }
            texts.push(el.dataset.originalText);
            elementMap.set(index, el);
        });

        if (texts.length === 0) return;

        let requestData = {
            from: "en",
            to: targetLang,
            data: texts,
            platform: "api"
        };

        try {
            let response = await fetch("https://api-b2b.backenster.com/b1/api/v3/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer a_hDUMEd7r1wJYYjRRrTnDy2n1EZiX24ksaOwRGN3KhJoosflDEMu3BCUKJAYk1ATBCVypEN23WrCAl6b3"
                },
                body: JSON.stringify(requestData)
            });

            let data = await response.json();

            if (data.result) {
                data.result.forEach((translatedText, index) => {
                    let el = elementMap.get(index);
                    if (el) {
                        el.textContent = translatedText;
                    }
                });
            } else {
                console.error("Translation failed: No results received.");
            }
        } catch (error) {
            console.error("Translation Error:", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const recommendations = [
        { img: "X.png", title: "Stock Market Surges Amid Economic Optimism", link: "index.html" },
        { img: "logo.jpg", title: "AI Breakthroughs: What’s Coming Next in 2025", link: "index.html" },
        { img: "tech.jpg", title: "Tech Giants Invest Billions in Renewable Energy", link: "index.html" },
        { img: "crypto.jpg", title: "Cryptocurrency Regulations Tighten Worldwide", link: "index.html" },
        { img: "news1.jpg", title: "Scientists Discover New Exoplanet with Signs of Life", link: "index.html" },
        { img: "news2.jpg", title: "Electric Cars Outsell Gasoline Vehicles for First Time", link: "index.html" },
        { img: "news3.jpg", title: "Major Cyberattack Hits Global Banking Systems", link: "index.html" },
        { img: "news4.jpg", title: "New Medical Breakthrough Extends Human Lifespan", link: "index.html" }
    ];

    const container = document.getElementById("recommendations-container");

    // Shuffle & Pick 4 Random
    const shuffled = recommendations.sort(() => 0.5 - Math.random()).slice(0, 4);

    // Create a fragment for smooth insertion (avoids flashing issues)
    const fragment = document.createDocumentFragment();

    shuffled.forEach(rec => {
        const recDiv = document.createElement("div");
        recDiv.classList.add("recommendation");

        const img = new Image();
        img.src = rec.img;
        img.alt = "Image";
        img.style.display = "none"; // Hide initially to avoid flicker
        img.onload = function () {
            this.style.display = "block"; // Show only when fully loaded
        };
        img.onerror = function () {
            this.src = "logo.jpg"; // Replace with fallback image
            this.style.display = "block"; // Ensure fallback shows
        };

        const p = document.createElement("p");
        p.classList.add("p2");
        p.setAttribute("data-translate", "true");
        p.textContent = rec.title;

        recDiv.appendChild(img);
        recDiv.appendChild(p);
        fragment.appendChild(recDiv);
    });

    // Append all at once (prevents reflow glitches)
    container.appendChild(fragment);
});

function enableLazyLoading() {
    document.querySelectorAll("p").forEach((p) => {
        p.classList.add("translating"); // Apply content-visibility only during translation
    });
}

// Call this function when translation starts
enableLazyLoading();

// Function to request location and store permission
function requestLocationPermission() {
    // Check if permission was already granted before
    if (localStorage.getItem("locationPermission") === "granted") {
        console.log("Permission already granted. Using stored location.");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: position.timestamp
                };
                // Store location data and permission status in localStorage
                localStorage.setItem("userLocation", JSON.stringify(userLocation));
                localStorage.setItem("locationPermission", "granted");
                console.log("Location stored:", userLocation);
            },
            (error) => {
                console.error("Error getting location:", error);
                localStorage.setItem("locationPermission", "denied");
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Function to check stored location
function getStoredLocation() {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
        console.log("Stored Location:", JSON.parse(storedLocation));
    } else {
        console.log("No stored location found.");
    }
}

// Run only if permission was never given or denied
if (localStorage.getItem("locationPermission") !== "granted") {
    requestLocationPermission();
}

// Fetch stored location without re-asking
getStoredLocation();
