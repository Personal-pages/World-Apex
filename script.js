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

// weather
const apiKey = "3fcd1d33745f573bf4ae7d9f58f7e85a"; 
let hourlyChartInstance = null;
let dailyChartInstance = null;

// Capital Cities for Countries
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

// Fetch Weather Data
async function getWeather(cityOrCountry = null, lat = null, lon = null) {
    let apiUrl;
    if (!cityOrCountry && lat === null && lon === null) {
        cityOrCountry = document.getElementById("city").value.trim();
    }

    if (!cityOrCountry && lat === null && lon === null) {
        alert("Please enter a city or country name.");
        return;
    }

    // If country name is entered, use its capital
    if (capitalCities[cityOrCountry]) {
        cityOrCountry = capitalCities[cityOrCountry];
    }

    if (lat !== null && lon !== null) {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCountry}&appid=${apiKey}&units=metric`;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("Location not found!");
            return;
        }

        // Update Weather Details
        document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
        document.getElementById("temperature").innerText = data.main.temp;
        document.getElementById("feels_like").innerText = data.main.feels_like;
        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("wind").innerText = data.wind.speed;
        document.getElementById("pressure").innerText = data.main.pressure;
        document.getElementById("sunrise").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        document.getElementById("sunset").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById("description").innerText = data.weather[0].description;

        // Update Enhanced Weather Icons Based on Time of Day
        updateWeatherIcon(data.weather[0].icon, data.sys.sunrise, data.sys.sunset, data.dt);

        // Fetch Additional Data
        getAirQuality(data.coord.lat, data.coord.lon);
        getUVIndex(data.coord.lat, data.coord.lon);
        getForecast(data.coord.lat, data.coord.lon);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Enhanced Weather Icon Based on Day/Night
function updateWeatherIcon(iconCode, sunrise, sunset, currentTime) {
    let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Check if it's night time
    if (currentTime < sunrise || currentTime > sunset) {
        iconUrl = iconUrl.replace("d", "n");
    }

    document.getElementById("weather-icon").src = iconUrl;
}

// Fetch Air Quality Index (AQI)
async function getAirQuality(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("aqi").innerText = data.list[0].main.aqi;
    } catch (error) {
        console.error("Error fetching AQI:", error);
    }
}

// Fetch UV Index
async function getUVIndex(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("uv").innerText = data.value;
    } catch (error) {
        console.error("Error fetching UV Index:", error);
    }
}

// Fetch 24-Hour & 5-Day Forecast
async function getForecast(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const labels = data.list.map(item => new Date(item.dt * 1000).getHours() + ":00");
        const temps = data.list.map(item => item.main.temp);

        updateChart("hourlyChart", labels.slice(0, 8), temps.slice(0, 8), "24-Hour Forecast");
        updateChart("dailyChart", labels.filter((_, i) => i % 8 === 0), temps.filter((_, i) => i % 8 === 0), "5-Day Forecast");
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

// Update Chart.js Graphs
function updateChart(canvasId, labels, data, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }

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

// Auto-detect location or default to India (Delhi)
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
