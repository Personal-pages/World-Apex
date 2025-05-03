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
        header.style.top = '-80px';  // Move header up
        navBar.style.top = '-80px';  // Move nav-bar up (hidden)
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
        localStorage.setItem("selectedLanguage", targetLang); 
        await translatePage(targetLang);
    });

    async function translatePage(targetLang) {
        let elements = document.querySelectorAll("[data-translate], #translatable");

        let texts = [];
        let elementMap = new Map();

        elements.forEach((el, index) => {
            if (!el.dataset.originalText) {
                el.dataset.originalText = el.textContent.trim(); 
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
    const container = document.getElementById("recommendations-container");
    if (!container) {
        console.warn(" #recommendations-container not found in DOM");
        return; // Stop further execution
    }

    const recommendations = [
        {
            title: "Zelenskyy Says Ukraine Will Observe Easter Truce, Alleges Violations by Russia",
            img: "https://worldapex.space/images/zelenskyy-easter-truce.avif",
            link: "https://worldapex.space/News/World/ukraine-easter-truce.html",
            "data-translate": "true"
        },
        {
            title: "India's First Prototype Fast-Breeder Reactor to Be Commissioned by September 2026",
            img: "https://worldapex.space/images/fast-breeder-reactor-india.avif",
            link: "https://worldapex.space/fast-breeder-reactor-india.html",
            "data-translate": "true"
        },
        {
            title: "Ananya Panday Joins Chanel as First Indian Brand Ambassador",
            img: "https://worldapex.space/images/ananya-panday-chanel.avif",
            link: "https://worldapex.space/ananya-panday-chanel.html",
            "data-translate": "true"
        },
        {
            title: "India Targets 23% GDP Share from Manufacturing, Boosted by Sunrise Sectors",
            img: "https://worldapex.space/images/india-manufacturing-growth.avif",
            link: "https://worldapex.space/News/World/india-manufacturing-gdp.html",
            "data-translate": "true"
        },
       
    ];

    // Shuffle the recommendations array and pick 4 random items
    const shuffled = recommendations.sort(() => 0.5 - Math.random()).slice(0, 4);

    // Create the fragment to hold the recommendations
    const fragment = document.createDocumentFragment();
    shuffled.forEach(rec => {
        const recDiv = document.createElement("div");
        recDiv.classList.add("recommendation");
        recDiv.style.cursor = "pointer";

        // Handle click to redirect to the news article
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
            this.src = "https://worldapex.space/pannel.webp"; // Fallback image
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
// Slider

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector('.slider-wrapper');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    let startX, isDragging = false, moveX = 0;

    if (!slider) {
        console.warn(" .slider-wrapper not found in DOM");
        return;
    }

    function updateSlidePosition() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function moveToSlide(index) {
        currentIndex = index;
        updateSlidePosition();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % dots.length;
        updateSlidePosition();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + dots.length) % dots.length;
        updateSlidePosition();
    }

    slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        moveX = e.clientX - startX;
    });

    slider.addEventListener('mouseup', () => {
        if (!isDragging) return;
        if (moveX < -50) nextSlide();
        else if (moveX > 50) prevSlide();
        isDragging = false;
        moveX = 0;
    });

    slider.addEventListener('mouseleave', () => isDragging = false);
    
    setInterval(nextSlide, 3500);
});


      const toggleBtn = document.getElementById('menu-toggle');
      const headerNav = document.getElementById('header-nav');
    
      toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('open');
        headerNav.classList.toggle('show');
      });
    
      
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          headerNav.classList.remove('show');
          toggleBtn.classList.remove('open');
        }
      });

        const applyTwitterTheme = () => {
          const isDark = document.body.classList.contains("dark-mode");
          const tweets = document.querySelectorAll('blockquote.twitter-tweet');
        
          tweets.forEach(tweet => {
            if (isDark) {
              tweet.setAttribute("data-theme", "dark");
            } else {
              tweet.removeAttribute("data-theme");
            }
          });
        
          if (window.twttr && twttr.widgets) {
            twttr.widgets.load();
          }
        };
        
       
        document.addEventListener("DOMContentLoaded", applyTwitterTheme);
        
       
        const observer = new MutationObserver(applyTwitterTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });


              
       


    async function getVersion() {
  try {
    const res = await fetch('/version.txt?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Version fetch failed');
    const version = (await res.text()).trim();
    console.log('Fetched version:', version);
    return version;
  } catch (e) {
    console.error(e);
    return null;
  }
}

getVersion().then(version => {
  currentVersion = version;
  console.log('Current version:', currentVersion);

  setInterval(async () => {
    const latestVersion = await getVersion();
    console.log('Checking against:', latestVersion);
    if (latestVersion && latestVersion !== currentVersion) {
      console.log('Version updated, showing banner');
      document.getElementById('updateBanner').style.display = 'block';
    }
  }, 30000); 
});


    

    const checkbox = document.getElementById('consent-check');
    const button = document.getElementById('accept-btn');
    const btnText = button.querySelector('.btn-text');
  
    checkbox.addEventListener('change', function() {
      button.disabled = !checkbox.checked;
      if (checkbox.checked) {
        button.style.setProperty('background-color', '#ff6f3f', 'important');
        button.style.setProperty('color', '#ffffff', 'important');
      } else {
        button.style.setProperty('background-color', '#888', 'important');
        button.style.setProperty('color', '#ddd', 'important');
      }
    });
  
    button.addEventListener('click', function() {
      const existingLoader = button.querySelector('.loader-container');
      if (!existingLoader) {
        btnText.style.opacity = '0';
        const loader = document.createElement("div");
        loader.className = "loader-container";
        loader.setAttribute("role", "progressbar");
        loader.innerHTML = `
          <svg class="loader-svg" viewBox="0 0 100 100" aria-label="Loading...">
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(-90 50 50)" opacity="0"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(-45 50 50)" opacity="0.125"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(0 50 50)" opacity="0.25"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(45 50 50)" opacity="0.375"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(90 50 50)" opacity="0.5"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(135 50 50)" opacity="0.625"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(180 50 50)" opacity="0.75"></rect>
            <rect class="loader-rect" height="10" rx="5" ry="5" width="28" x="67" y="45" transform="rotate(225 50 50)" opacity="0.875"></rect>
          </svg>
        `;
        button.appendChild(loader);
  
       
        setTimeout(() => {
          document.getElementById('consent-popup').style.display = 'none';
          localStorage.setItem('cookieConsent', 'true');
        }, 400); 
      }
    });
  
    // Hide popup if already accepted
    if (localStorage.getItem('cookieConsent') === 'true') {
      document.getElementById('consent-popup').style.display = 'none';
    }
document.getElementById("toggle-consent").onclick = function () {
      document.getElementById("consent-popup").style.transform = "translateY(100%)";
    };

    const originalConsoleError = console.error;
console.error = function (message, ...args) {
  if (typeof message === 'string' && message.includes("Permission policy 'WebShare'")) return;
  originalConsoleError.apply(console, [message, ...args]);
};