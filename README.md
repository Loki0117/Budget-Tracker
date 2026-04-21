# 🧡 Oh Yes Events — Budget Tracker

A professional, feature-rich budget management system for event planners to track receivables from clients and payables to vendors with real-time calculations, GST tracking, and export capabilities.

![Orange Theme Preview](https://via.placeholder.com/800x400?text=Oh+Yes+Events+Budget+Tracker)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [File Structure](#file-structure)
- [How to Use](#how-to-use)
- [Features in Detail](#features-in-detail)
- [Export Formats](#export-formats)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Browser Support](#browser-support)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## 📖 Overview

The **Oh Yes Events Budget Tracker** is a standalone web application designed specifically for event management companies to:

- Track all client invoices and payments (Receivables)
- Monitor vendor contracts and payments (Payables)
- Calculate GST automatically
- View real-time financial summaries and margins
- Export data to Excel/CSV format
- Email reports directly to clients or stakeholders
- Store venue and event details

Perfect for wedding planners, corporate event organizers, and production houses managing multiple vendors and clients simultaneously.

---

## ✨ Features

### Core Features
- ✅ **Dual Section Management** – Separate tabs for Receivables and Payables
- ✅ **Real-time Calculations** – Automatic GST calculation and totals update
- ✅ **Dynamic Row Management** – Add, edit, or delete rows on the fly
- ✅ **Payment Status Tracking** – Outstanding, Partial, Cleared with visual progress bars
- ✅ **Comments Section** – Add notes for each transaction
- ✅ **Venue Details** – Dedicated section for event location information

### Financial Features
- 💰 **GST Management** – Support for 0%, 5%, 12%, 18%, 28% GST rates
- 📊 **Gross Margin Calculation** – Automatic margin calculation with percentage
- 🎯 **Health Indicators** – Visual indicators for margin health (Green/Orange/Red)
- 📈 **Collection Rate Tracking** – Real-time payment collection percentage

### Export & Reporting
- 📥 **CSV/Excel Export** – Download data in spreadsheet-friendly format
- 📋 **JSON Export** – Get complete structured data for backup or API integration
- ✉️ **Email Reports** – Send formatted reports directly from the app
- 🖨️ **Print View** – Print-friendly layout for physical copies

### User Interface
- 🎨 **Orange & White Theme** – Branded color scheme matching Oh Yes Events
- 📱 **Responsive Design** – Works on desktop, tablet, and mobile devices
- ⚡ **Fast Interactions** – No page reloads, instant updates
- 🔍 **Hover Effects** – Interactive visual feedback on all clickable elements

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure and semantics |
| CSS3 | Styling, animations, responsive design |
| JavaScript (ES6+) | Dynamic functionality, calculations, data management |
| Google Fonts | DM Serif Display & DM Sans typography |
| Local Storage | Data persistence (can be added) |

**No frameworks or external dependencies!** Pure vanilla JavaScript for maximum compatibility and performance.

---

## 💻 Installation

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- VS Code or any text editor (for customization)
- Basic understanding of HTML/CSS/JS (for modifications)

### Setup Instructions

1. **Clone or Download the Project**
   ```bash
   git clone https://github.com/yourusername/oh-yes-budget-tracker.git




   oh-yes-budget-tracker/
│
├── index.html              # Main dashboard (Receivables + Payables)
├── receivables.html        # Standalone Receivables page
├── payables.html           # Standalone Payables page
├── style.css               # Complete styling (Orange & White theme)
├── app.js                  # Main application logic
├── receivables.js          # Standalone receivables logic
├── payables.js             # Standalone payables logic
└── README.md               # Documentation
