/**
 * Ramadan TV Standby App
 * Pure vanilla JavaScript - no frameworks
 */

// ==========================================
// Configuration
// ==========================================
const CONFIG = {
    city: 'Doha',
    country: 'Qatar',
    lat: 25.2854,
    lon: 51.5310,
    ramadanStart: new Date('2026-02-18'),
    ramadanEnd: new Date('2026-03-19'),
    totalDays: 30
};

const HIJRI_MONTHS = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PRAYERS = [
    { id: 'fajr', name: 'Fajr', icon: '🌙' },
    { id: 'sunrise', name: 'Sunrise', icon: '🌅' },
    { id: 'dhuhr', name: 'Dhuhr', icon: '☀️' },
    { id: 'asr', name: 'Asr', icon: '🌤️' },
    { id: 'maghrib', name: 'Maghrib', icon: '🌇' },
    { id: 'isha', name: 'Isha', icon: '🌃' }
];

// ==========================================
// State
// ==========================================
let state = {
    prayerTimes: { fajr: '04:30', sunrise: '05:45', dhuhr: '11:45', asr: '15:15', maghrib: '18:00', isha: '19:15' },
    weather: { temp: 28, icon: '☀️' },
    dailyVerse: { arabic: '', surah: '' }
};

// ==========================================
// Utility Functions
// ==========================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const pad = (n) => String(n).padStart(2, '0');

function toArabicNum(n) {
    const ar = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n).split('').map(d => ar[+d] || d).join('');
}

function gregorianToHijri(date) {
    const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;
    return { year, month, day };
}

function timeToMins(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function formatTime12(t) {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${pad(m)} ${period}`;
}

// ==========================================
// Stars Generation
// ==========================================
function createStars() {
    const container = $('#stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 4}s;
            animation-duration: ${3 + Math.random() * 3}s;
        `;
        container.appendChild(star);
    }
}

// ==========================================
// Clock Update
// ==========================================
function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const isPM = h >= 12;
    
    // 12-hour format
    const hour12 = h % 12 || 12;
    
    $('#hours').textContent = pad(hour12);
    $('#minutes').textContent = pad(m);
    $('#seconds').textContent = pad(s);
    $('#period').textContent = isPM ? 'PM' : 'AM';
    
    // Gregorian date
    $('#gregorianDate').textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    
    // Hijri date
    const hijri = gregorianToHijri(now);
    $('#hijriDate').textContent = `${toArabicNum(hijri.day)} ${HIJRI_MONTHS[hijri.month - 1]} ${toArabicNum(hijri.year)}`;
}

// ==========================================
// Ramadan Progress
// ==========================================
function updateRamadanProgress() {
    const now = new Date();
    const { ramadanStart, ramadanEnd, totalDays } = CONFIG;
    
    let currentDay = 0;
    let isInRamadan = false;
    let isLastTen = false;
    let isBeforeRamadan = false;
    let daysUntilRamadan = 0;
    
    if (now >= ramadanStart && now <= ramadanEnd) {
        isInRamadan = true;
        currentDay = Math.floor((now - ramadanStart) / (1000 * 60 * 60 * 24)) + 1;
        isLastTen = currentDay >= 21;
    } else if (now < ramadanStart) {
        isBeforeRamadan = true;
        daysUntilRamadan = Math.ceil((ramadanStart - now) / (1000 * 60 * 60 * 24));
    } else {
        currentDay = totalDays;
    }
    
    // Update text based on state
    if (isBeforeRamadan) {
        if (daysUntilRamadan === 1) {
            $('#ramadanDayText').textContent = 'Ramadan starts tomorrow!';
        } else {
            $('#ramadanDayText').textContent = `Ramadan in ${daysUntilRamadan} days`;
        }
        $('#progressFill').style.width = '0%';
    } else if (isInRamadan) {
        $('#ramadanDayText').textContent = `Day ${currentDay} of ${totalDays}`;
        const percent = Math.min((currentDay / totalDays) * 100, 100);
        $('#progressFill').style.width = `${percent}%`;
    } else {
        $('#ramadanDayText').textContent = 'Ramadan Completed';
        $('#progressFill').style.width = '100%';
    }
    
    // Show/hide last 10 nights section
    const lastTenSection = $('#lastTenSection');
    if (isLastTen) {
        lastTenSection.style.display = 'block';
    } else {
        lastTenSection.style.display = 'none';
    }
}

// ==========================================
// Prayer Times
// ==========================================
function renderPrayerTimes() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const list = $('#prayersList');
    list.innerHTML = '';
    
    let nextPrayer = null;
    
    PRAYERS.forEach(p => {
        const time = state.prayerTimes[p.id];
        const mins = timeToMins(time);
        const isPassed = mins < currentMins;
        const isNext = !nextPrayer && mins > currentMins;
        
        if (isNext) nextPrayer = { ...p, time, mins };
        
        const div = document.createElement('div');
        div.className = `prayer-item${isNext ? ' active' : ''}${isPassed ? ' passed' : ''}`;
        div.innerHTML = `
            <span class="prayer-name">
                <span class="prayer-icon">${p.icon}</span>
                ${p.name}
            </span>
            <span class="prayer-time">${formatTime12(time)}</span>
        `;
        list.appendChild(div);
    });
    
    // If no next prayer found today, it's Fajr tomorrow
    if (!nextPrayer) {
        nextPrayer = { ...PRAYERS[0], time: state.prayerTimes.fajr, mins: timeToMins(state.prayerTimes.fajr) };
    }
    
    return nextPrayer;
}

function updatePrayerCountdown() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const currentSecs = now.getSeconds();
    
    // Find next prayer
    let nextPrayer = null;
    for (const p of PRAYERS) {
        const mins = timeToMins(state.prayerTimes[p.id]);
        if (mins > currentMins) {
            nextPrayer = { name: p.name, mins };
            break;
        }
    }
    
    // If none found, next is Fajr tomorrow
    if (!nextPrayer) {
        nextPrayer = { name: 'Fajr', mins: timeToMins(state.prayerTimes.fajr) + 24 * 60 };
    }
    
    let minsUntil = nextPrayer.mins - currentMins;
    if (minsUntil < 0) minsUntil += 24 * 60;
    
    const h = Math.floor(minsUntil / 60);
    const m = minsUntil % 60;
    const s = 59 - currentSecs;
    
    $('#nextPrayerName').textContent = nextPrayer.name;
    $('#nextPrayerCountdown').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ==========================================
// Iftar/Suhoor Countdown
// ==========================================
function updateIftarCountdown() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const currentSecs = now.getSeconds();
    
    const fajrMins = timeToMins(state.prayerTimes.fajr);
    const maghribMins = timeToMins(state.prayerTimes.maghrib);
    
    let label, targetMins, targetTime;
    
    // Before Fajr or after Maghrib = Suhoor countdown
    if (currentMins < fajrMins) {
        label = 'Suhoor ends in';
        targetMins = fajrMins;
        targetTime = state.prayerTimes.fajr;
    } else if (currentMins >= maghribMins) {
        label = 'Suhoor ends in';
        targetMins = fajrMins + 24 * 60; // Tomorrow's Fajr
        targetTime = state.prayerTimes.fajr;
    } else {
        label = 'Iftar in';
        targetMins = maghribMins;
        targetTime = state.prayerTimes.maghrib;
    }
    
    let minsUntil = targetMins - currentMins;
    if (minsUntil < 0) minsUntil += 24 * 60;
    
    const h = Math.floor(minsUntil / 60);
    const m = minsUntil % 60;
    const s = 59 - currentSecs;
    
    $('#iftarLabel').innerHTML = `<span class="iftar-icon">${label.includes('Iftar') ? '🍽️' : '🌙'}</span>${label}`;
    $('#iftarCountdown').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    $('#iftarTargetTime').textContent = formatTime12(targetTime);
}

// ==========================================
// Today's Fast Card
// ==========================================
function updateFastCard() {
    const fajrTime = state.prayerTimes.fajr;
    const maghribTime = state.prayerTimes.maghrib;
    
    // Calculate fasting duration
    const fajrMins = timeToMins(fajrTime);
    const maghribMins = timeToMins(maghribTime);
    const durationMins = maghribMins - fajrMins;
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    
    // Format times without AM/PM for cleaner look
    const suhoorDisplay = formatTime12(fajrTime).replace(' AM', '').replace(' PM', '');
    const iftarDisplay = formatTime12(maghribTime).replace(' AM', '').replace(' PM', '');
    
    $('#suhoorTime').textContent = suhoorDisplay;
    $('#iftarTimeDisplay').textContent = iftarDisplay;
    $('#fastDuration').textContent = `${hours}h ${mins}m`;
}

// ==========================================
// Quran Verse API
// ==========================================
async function fetchDailyVerse(forceNew = false) {
    try {
        // Get a verse based on day of year for variety, or random if forceNew
        let verseIndex;
        const verseNumbers = [2183, 2185, 2186, 2187, 97, 44, 2152, 2153, 2155, 2156, 2157, 2201, 2286, 3190, 3191, 3192, 13028, 94];
        
        if (forceNew) {
            verseIndex = Math.floor(Math.random() * verseNumbers.length);
        } else {
            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            verseIndex = dayOfYear % verseNumbers.length;
        }
        
        const verseId = verseNumbers[verseIndex];
        
        // Fetch Arabic
        const arabicRes = await fetch(`https://api.alquran.cloud/v1/ayah/${verseId}`);
        const arabicData = await arabicRes.json();
        
        if (arabicData.code === 200) {
            state.dailyVerse = {
                arabic: arabicData.data.text,
                surah: `${arabicData.data.surah.englishName} ${arabicData.data.surah.number}:${arabicData.data.numberInSurah}`
            };
            updateVerseDisplay();
        }
    } catch (e) {
        console.log('Quran API error:', e);
        // Fallback
        state.dailyVerse = {
            arabic: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ',
            surah: 'Al-Baqarah 2:185'
        };
        updateVerseDisplay();
    }
}

function updateVerseDisplay() {
    const verse = state.dailyVerse;
    if (verse.arabic) {
        $('#verseArabic').textContent = verse.arabic;
        $('#verseSurah').textContent = verse.surah;
    }
}

// ==========================================
// API Fetches
// ==========================================
async function fetchPrayerTimes() {
    try {
        const d = new Date();
        const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${CONFIG.lat}&longitude=${CONFIG.lon}&method=10`;
        const res = await fetch(url);
        const data = await res.json();
        const t = data.data.timings;
        
        state.prayerTimes = {
            fajr: t.Fajr.slice(0, 5),
            sunrise: t.Sunrise.slice(0, 5),
            dhuhr: t.Dhuhr.slice(0, 5),
            asr: t.Asr.slice(0, 5),
            maghrib: t.Maghrib.slice(0, 5),
            isha: t.Isha.slice(0, 5)
        };
        
        renderPrayerTimes();
    } catch (e) {
        console.log('Prayer API error:', e);
    }
}

async function fetchWeather() {
    try {
        const res = await fetch(`https://wttr.in/${CONFIG.city}?format=j1`);
        const data = await res.json();
        const c = data.current_condition[0];
        
        const code = c.weatherCode;
        let icon = '☀️';
        if (code.includes('116') || code.includes('119')) icon = '☁️';
        else if (code.includes('176') || code.includes('296') || code.includes('299')) icon = '🌧️';
        else if (code.includes('200')) icon = '⛈️';
        else if (code.includes('113')) icon = '☀️';
        
        state.weather = { temp: c.temp_C, icon };
        
        $('#weatherIcon').textContent = icon;
        $('#weatherTemp').textContent = `${c.temp_C}°`;
    } catch (e) {
        console.log('Weather API error:', e);
    }
}

// ==========================================
// TV Remote Controls
// ==========================================
let focusableElements = [];
let currentFocusIndex = -1;
let inactivityTimeout = null;
let controlsTimeout = null;

function hideControlsAndFocus() {
    // Hide controls
    $('#tvControls').classList.remove('active');
    // Remove focus from all elements
    focusableElements.forEach(el => el.classList.remove('focused'));
    currentFocusIndex = -1;
}

function resetInactivityTimer() {
    // Show controls
    $('#tvControls').classList.add('active');
    
    // Clear existing timers
    clearTimeout(inactivityTimeout);
    clearTimeout(controlsTimeout);
    
    // Set new 30 second timer
    inactivityTimeout = setTimeout(hideControlsAndFocus, 30000);
}

function setupTVControls() {
    // Get all focusable elements
    focusableElements = Array.from($$('.tv-focusable'));
    
    // Samsung TV remote key codes
    const KEYS = {
        LEFT: [37, 'ArrowLeft'],
        RIGHT: [39, 'ArrowRight'],
        UP: [38, 'ArrowUp'],
        DOWN: [40, 'ArrowDown'],
        ENTER: [13, 'Enter'],
        BACK: [8, 'Backspace', 10009],
        RED: [403, 'ColorF0Red'],
        GREEN: [404, 'ColorF1Green'],
        YELLOW: [405, 'ColorF2Yellow'],
        BLUE: [406, 'ColorF3Blue'],
        PLAY: [415, 'MediaPlay'],
        PAUSE: [19, 'MediaPause'],
        PLAY_PAUSE: [10252, 'MediaPlayPause']
    };
    
    function isKey(e, keyArr) {
        return keyArr.includes(e.keyCode) || keyArr.includes(e.key);
    }
    
    function updateFocus(newIndex) {
        // Remove old focus
        focusableElements.forEach(el => el.classList.remove('focused'));
        
        // Set new focus
        if (newIndex >= 0 && newIndex < focusableElements.length) {
            currentFocusIndex = newIndex;
            focusableElements[currentFocusIndex].classList.add('focused');
            focusableElements[currentFocusIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    function navigateHorizontal(direction) {
        if (focusableElements.length === 0) return;
        
        if (currentFocusIndex === -1) {
            updateFocus(0);
        } else {
            const newIndex = currentFocusIndex + direction;
            if (newIndex >= 0 && newIndex < focusableElements.length) {
                updateFocus(newIndex);
            }
        }
    }
    
    function navigateVertical(direction) {
        // For vertical navigation, jump between major sections
        if (focusableElements.length === 0) return;
        
        if (currentFocusIndex === -1) {
            updateFocus(0);
        } else {
            // Jump by 3 elements for vertical nav (approximate row jump)
            const newIndex = currentFocusIndex + (direction * 3);
            if (newIndex >= 0 && newIndex < focusableElements.length) {
                updateFocus(newIndex);
            } else if (direction > 0) {
                updateFocus(focusableElements.length - 1);
            } else {
                updateFocus(0);
            }
        }
    }
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
    
    function refreshData() {
        fetchPrayerTimes();
        fetchWeather();
        // Show feedback
        showToast('Refreshing data...');
    }
    
    function newVerse() {
        fetchDailyVerse(true); // Force new verse
        showToast('Loading new verse...');
    }
    
    document.addEventListener('keydown', (e) => {
        // Reset inactivity timer on any key press
        resetInactivityTimer();
        
        // Navigation
        if (isKey(e, KEYS.LEFT)) {
            e.preventDefault();
            navigateHorizontal(-1);
        } else if (isKey(e, KEYS.RIGHT)) {
            e.preventDefault();
            navigateHorizontal(1);
        } else if (isKey(e, KEYS.UP)) {
            e.preventDefault();
            navigateVertical(-1);
        } else if (isKey(e, KEYS.DOWN)) {
            e.preventDefault();
            navigateVertical(1);
        }
        
        // Enter/OK - activate focused element
        else if (isKey(e, KEYS.ENTER)) {
            e.preventDefault();
            if (currentFocusIndex >= 0) {
                const el = focusableElements[currentFocusIndex];
                el.click?.();
            }
        }
        
        // Color buttons
        else if (isKey(e, KEYS.RED) || e.key.toLowerCase() === 'r') {
            e.preventDefault();
            refreshData();
        }
        else if (isKey(e, KEYS.GREEN) || e.key.toLowerCase() === 'f') {
            e.preventDefault();
            toggleFullscreen();
        }
        else if (isKey(e, KEYS.YELLOW) || e.key.toLowerCase() === 'v') {
            e.preventDefault();
            newVerse();
        }
        
        // Back button - exit fullscreen
        else if (isKey(e, KEYS.BACK)) {
            if (document.fullscreenElement) {
                e.preventDefault();
                document.exitFullscreen?.();
            }
        }
    });
    
    // Hide controls initially after 30 seconds
    inactivityTimeout = setTimeout(hideControlsAndFocus, 30000);
}

// Toast notification for feedback
function showToast(message) {
    let toast = $('#toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px 40px;
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid var(--gold);
            border-radius: 16px;
            font-size: 24px;
            color: white;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

// ==========================================
// Main Loop
// ==========================================
function tick() {
    updateClock();
    updatePrayerCountdown();
    updateIftarCountdown();
    updateFastCard();
}

// ==========================================
// Initialize
// ==========================================
function init() {
    // Location
    $('#locationText').textContent = `${CONFIG.city}, ${CONFIG.country}`;
    
    // Create stars
    createStars();
    
    // Initial updates
    updateClock();
    updateRamadanProgress();
    renderPrayerTimes();
    updateFastCard();
    
    // Fetch data
    fetchPrayerTimes();
    fetchWeather();
    fetchDailyVerse();
    
    // Start clock
    setInterval(tick, 1000);
    
    // Refresh data periodically
    setInterval(fetchPrayerTimes, 3600000); // Every hour
    setInterval(fetchWeather, 600000); // Every 10 min
    setInterval(fetchDailyVerse, 86400000); // Every day
    
    // Update Ramadan progress at midnight
    setInterval(updateRamadanProgress, 60000);
    
    // TV Remote controls
    setupTVControls();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);