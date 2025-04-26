✅ Deskripsi Project React.js 

📌 **Nama Project:** Web IoT – Aplikasi Dashboard IoT Berbasis Web  
👨‍💻 **Developer:** Imam Ariadi  
🔗 **Repo GitHub:** [github.com/ImamAriadi2022/web-iot/tree/main/iot](https://github.com/ImamAriadi2022/web-iot/tree/main/iot)

---

### 🧾 Deskripsi Project

**Web IoT** adalah aplikasi dashboard berbasis **React.js** yang dirancang untuk memantau dan mengontrol perangkat **Internet of Things (IoT)** secara real-time. Aplikasi ini menawarkan antarmuka yang intuitif dan mudah digunakan untuk mengontrol berbagai perangkat seperti lampu, sensor, atau modul lainnya yang terhubung ke jaringan.

#### 🚀 Fitur Utama:
- 📊 **Realtime Dashboard:** Menampilkan data dari perangkat IoT (seperti suhu, kelembaban, dll) secara dinamis.
- 🎛️ **Kontrol Perangkat:** Tombol switch/kontrol untuk mengaktifkan atau menonaktifkan perangkat secara langsung.
- 🔄 **Integrasi API:** Terhubung dengan endpoint API dari device (seperti ESP8266/ESP32) untuk update status dan kontrol.
- 💻 **UI Responsif:** Tampilan responsif dan modern menggunakan React Component dan CSS.

#### 🧩 Teknologi yang Digunakan:
- **Frontend:** React.js, JSX, CSS
- **State Management:** useState, useEffect (React Hooks)
- **Komunikasi API:** Fetch API / Axios (tergantung implementasi kamu)
- **IoT Device:** Siap diintegrasikan dengan ESP8266/ESP32 menggunakan HTTP

#### 📁 Struktur Project (React):
```
/iot
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── [Komponen UI kamu seperti Switch, Card, dll]
│   ├── App.js
│   ├── index.js
│   └── App.css
├── package.json
└── README.md
```

---

### 📌 Cara Menjalankan Project

1. Clone repo:
```bash
git clone https://github.com/ImamAriadi2022/web-iot.git
cd web-iot/iot
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan:
```bash
npm start
```

---

### 📲 Integrasi IoT

Project ini dirancang agar dapat terhubung dengan perangkat IoT seperti **ESP8266/ESP32**, yang mengirim atau menerima data melalui **HTTP API**. Komunikasi dua arah ini memungkinkan dashboard mengontrol dan menerima status perangkat secara langsung.

---
