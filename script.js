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
document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("city");
    const locationText = document.getElementById("location");

    // Make City Name empty initially
    if (locationText) locationText.innerText = "";

    // Auto-fetch weather based on user's location (without asking)
    fetch("https://ipapi.co/json/")
        .then((response) => response.json())
        .then((data) => {
            if (data && data.city) {
                locationText.innerText = data.city; // Show detected city
                getWeather(data.city);
            } else {
                locationText.innerText = "Delhi"; // Default if location fails
                getWeather("Delhi");
            }
        })
        .catch(() => {
            locationText.innerText = "Delhi"; // Default if API fails
            getWeather("Delhi");
        });

    // Add keypress event for Enter key
    if (cityInput) {
        cityInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                getWeather(cityInput.value);
            }
        });
    }
});

async function getWeather(city = "Delhi") {
    const API_KEY = "3fcd1d33745f573bf4ae7d9f58f7e85a";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        console.log(`🔍 Fetching Weather Data from: ${url}`);
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            console.error(`❌ Error fetching weather: ${data.message}`);
            return;
        }

        console.log("🌦️ Weather API Response:", data);
        updateWeatherUI(data);
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
    }
}

function updateWeatherUI(data) {
    if (!data || !data.main) {
        console.error("❌ Error: Invalid weather data received.");
        return;
    }

    const weatherData = {
        location: data.name || "Unknown Location",
        description: data.weather[0]?.description || "N/A",
        temperature: data.main.temp.toFixed(1),
        feels_like: data.main.feels_like.toFixed(1),
        humidity: data.main.humidity,
        wind: data.wind.speed.toFixed(1),
        pressure: data.main.pressure,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
    };

    // Update weather icon
    const weatherIcon = document.getElementById("weather-icon");
    if (weatherIcon && data.weather[0]?.icon) {
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.alt = data.weather[0]?.description || "Weather Icon";
    }

    // Update all elements in the UI
    Object.keys(weatherData).forEach((key) => {
        const element = document.getElementById(key);
        if (!element) {
            console.warn(`⚠️ Missing Element: #${key}`);
            return;
        }
        element.innerText = weatherData[key];
    });

    console.log("✅ Weather data updated in UI!");
}


// --- CHARTS ---
async function getWeatherForecast() {
    const city = document.getElementById("city").value.trim() || "Delhi";
    const apiKey = "3fcd1d33745f573bf4ae7d9f58f7e85a";
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        console.log("📊 Forecast API Response:", data);

        updateCharts(data);
    } catch (error) {
        console.error("❌ Error fetching forecast data:", error);
    }
}

function updateCharts(data) {
    if (!data || !data.list) {
        console.error("❌ Error: Invalid forecast data received.");
        return;
    }

    const hourlyLabels = [];
    const hourlyTemps = [];

    const dailyLabels = [];
    const dailyTemps = [];

    // Process the forecast data
    data.list.forEach((entry, index) => {
        const date = new Date(entry.dt * 1000);
        const hour = date.getHours();

        // Hourly data for 24h
        if (index < 8) {
            hourlyLabels.push(`${hour}:00`);
            hourlyTemps.push(entry.main.temp.toFixed(1));
        }

        // Daily data (every 8th entry is roughly a new day)
        if (index % 8 === 0) {
            dailyLabels.push(date.toLocaleDateString());
            dailyTemps.push(entry.main.temp.toFixed(1));
        }
    });

    renderChart("hourlyChart", "Temperature (°C) - Next 24H", hourlyLabels, hourlyTemps);
    renderChart("dailyChart", "Temperature (°C) - Next 5 Days", dailyLabels, dailyTemps);
}

function renderChart(canvasId, label, labels, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error(`❌ Missing Canvas Element: #${canvasId}`);
        return;
    }

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: "rgb(255, 60, 0)",
                fill: false,
                tension: 0.3,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Temperature (°C)" } },
            },
        },
    });
}

// Fetch initial forecast data
document.addEventListener("DOMContentLoaded", getWeatherForecast);


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
        
        { img: "amit-shah-chennai.avif", title: "Amit Shah to Visit Chennai Amid AIADMK-BJP Alliance Buzz", link: "amit-shah-chennai-visit.html" },
        {
            img: "kiren-rijiju-manipur.webp",
            title: "Kiren Rijiju Defends Holding Manipur Debate Past Midnight",
            link: "rijiju-manipur-debate.html"
        },
        {
            img: "csk-vs-dc-2025.avif",
            title: "IPL 2025: DC Breaks Chepauk Jinx, Beats CSK by 25 Runs",
            link: "ipl2025-csk-vs-dc.html"
        },
        {
            img: "kancha-gachibowli.avif",
            title: "SC Raises Alarm Over Destruction in Kancha Gachibowli ‘Forest’",
            link: "kancha-gachibowli-sc.html"
        },
        {
            img: "nvidia-quantum.webp",
            title: "Nvidia to Open Quantum Computing Lab, CEO Confirms.",
            link: "nvidia-quantum-lab.html"
        }
    ];

    const container = document.getElementById("recommendations-container");

    // Shuffle and pick 4 recommendations
    const shuffled = recommendations.sort(() => 0.5 - Math.random()).slice(0, 4);
    const fragment = document.createDocumentFragment();

    shuffled.forEach(rec => {
        const recDiv = document.createElement("div");
        recDiv.classList.add("recommendation");
        // Set the pointer cursor
        recDiv.style.cursor = "pointer";

        // Make the whole recommendation clickable
        recDiv.addEventListener("click", () => {
            window.location.href = rec.link;
        });

        const img = new Image();
        img.src = rec.img;
        img.alt = rec.title;
        img.style.display = "none";
        img.onload = function () {
            this.style.display = "block";
        };
        img.onerror = function () {
            this.src = "logo.jpg";
            this.style.display = "block";
        };

        const p = document.createElement("p");
        p.classList.add("p2");
        p.setAttribute("data-translate", "true");
        p.textContent = rec.title;

        recDiv.appendChild(img);
        recDiv.appendChild(p);
        fragment.appendChild(recDiv);
    });

    container.appendChild(fragment);
});
