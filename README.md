# 🕋 PrayerTime is now Global

PrayerTime is a powerful, lightweight, and highly customizable Chrome extension designed to help Muslims **worldwide** keep track of their daily prayers. Instantly see the time remaining until the next prayer and view all timings for the day directly in your browser.

Originally built for Bangladesh, this extension has evolved into a **global tool** with advanced configuration options to ensure accuracy and a personalized experience for every user.

[![Download PrayerTime](https://i.postimg.cc/W3HmW2my/8241704-removebg-preview.png)](https://chromewebstore.google.com/detail/prayertime-bd/pcnigmnekhgconipkmhlfhbjddhcjcdj)

## ✨ New & Core Features

* **Global Manual Location Search:** Search and set your location. You can also input **Manual Coordinates (Latitude/Longitude)** for pinpoint precision.
* **Advanced Calculation Engine:** Fine-tune your timings with advance settings:
    * **Calculation Method:** Select from global authorities (e.g., Auto, ISNA, Muslim World League, etc.).
    * **Asr Method:** Choose between Hanafi and Shafi/Standard juristic methods.
    * **High Latitude Rule:** Optimized for users in northern regions (Angle-based, Mid-night, etc.).
* **Complete Theme Creator:** Customize the interface to match your style:
    * **Backgrounds:** Switch between Solid Colors and beautiful Gradients.
* **Offline Performance:** Once configured, calculations happen locally on your device—no internet connection required.

## 📸 Screenshots

| Appearance & Themes | Location Settings | Calculation Settings |

![Main Dashboard](https://raw.githubusercontent.com/HasanC14/PrayerTime-BD/main/public/screenshots/01.png) ![Appearance](https://raw.githubusercontent.com/HasanC14/PrayerTime-BD/main/public/screenshots/02.png) ![Location](https://raw.githubusercontent.com/HasanC14/PrayerTime-BD/main/public/screenshots/03.png) ![Calculation](https://raw.githubusercontent.com/HasanC14/PrayerTime-BD/main/public/screenshots/04.png) 

| *Live countdown and daily prayer schedule.* 
| *Build your own custom theme* 
| *Search globally or use coordinates* 
| *Advanced Juristic methods* 

## ⚙️ Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store page for PrayerTime](https://chromewebstore.google.com/detail/prayertime-bd/pcnigmnekhgconipkmhlfhbjddhcjcdj).
2. Click **Add to Chrome**.

### Manual Installation (Development)
1. Download the latest release and unzip it.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `dist` folder.

## 💻 Powered by Adhan-js
To provide the best performance and privacy, this extension has migrated away from external APIs. It now uses the **[Adhan-js](https://github.com/batoulapps/adhan-js)** library to calculate all prayer times locally. This means:
* **Zero Latency:** Times load instantly.
* **Privacy:** Your location data never leaves your browser.
* **Reliability:** It works even without an internet connection.

## 📄 License
This extension is licensed under the MIT License. See [LICENSE](LICENSE) for more information.
