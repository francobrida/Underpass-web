<p align="center">
  <!-- Add banner image here -->
  <img src="public/Underpass-front-banner.png" alt="Underpass banner" title="Underpass">
</p>

<p align="center">
  Check the <a href="#"><strong>live demo here</strong></a> and the API documentation <a href="https://underpass-api-production.up.railway.app/docs"><strong>here</strong></a> 
</p>

## 📚 Table of Contents

- [About](#about)
- [Tech Stack](#-tech-stack)
- [Features](#features)
- [Setup & Installation](#️-setup--installation)
- [Environment Variables](#-environment-variables)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Demo Accounts](#-demo-accounts)
- [Upcoming Improvements](#-upcoming-improvements)
- [Credits](#-credits)

## About

**UnderPass** is a decentralized electronic music agenda for the Barcelona underground scene. It features a unique trust-based verification system, physical attendance validation via QR/Stamps, and a qualitative feedback loop.

This repository contains the React frontend that consumes the [UnderPass API](https://github.com/francobrida/UnderPass-API). Built with React 19 and Vite, it provides a dynamic interface with role-based routing (Clubber, Organizer, Admin), gamification elements (stamps & points), and QR code management.

## 💻 Tech Stack

- **Framework:** React 19
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP client:** Axios
- **QR Generation:** qrcode.react

## Features

<p align="center">
  <!-- Add features overview image here -->
  <img src="public/Underpass-features.png" alt="Underpass Features" title="Underpass Features">
</p>

### Authentication

- Login, Register and Logout connected to the API via Bearer token (Laravel Passport).

### Vouch-to-Verify System

- **Waiting Room:** View unverified events pending approval.
- **Vouching:** Trusted users can "vouch" for an event. Reach 3 vouches to auto-verify!

### Role-Based Access Control

- **Clubber:** Vouch for events, collect stamps, and submit Vibechecks.
- **Organizer:** Manage QR codes for verified events and host multiple events.
- **Admin:** Full moderation and system control.

### Gamification & Vibechecks

- **Digital Passport & Stamps:** Scan a unique QR code at a verified event to receive a collectible Stamp.
- **Vibechecks:** Only attendees with a stamp can rate the event's Sound and Safety.
- **Leaderboard:** Community ranking based on points.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js >= 18
- **UnderPass API running locally** — follow the [API setup instructions](https://github.com/francobrida/UnderPass-API) before starting the frontend.

### Clone the repository

```bash
git clone https://github.com/francobrida/Underpass-web.git
cd Underpass-web
```

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in the root:

```bash
cp .env.example .env
```

### Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔑 Environment Variables

| Variable       | Description                  | Default                        |
| -------------- | ---------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the UnderPass API| `http://localhost:8000/api/v1` |

> All variables exposed to the browser must be prefixed with `VITE_`. This is a Vite security convention.

## Architecture

Built with **React 19** and **Vite**. 

All API calls are centralized and managed via Axios, where tokens are attached automatically once the user authenticates. React Router v7 handles protected routes, ensuring only Admins, Organizers, or authenticated Clubbers access their specific views.

## 🐳 Docker & Deployment

*(Note: Add Docker instructions if a Dockerfile is provided for the frontend)*

### Standard Build

```bash
npm run build
npm run preview
```

## Deployment

- **Frontend** — [Link to Frontend Demo](#)
- **API Docs** — [https://underpass-api-production.up.railway.app/docs](https://underpass-api-production.up.railway.app/docs)

## 👤 Demo Accounts

To test the app, use the demo accounts created by the API seeders.

| Role  |       Email        | Password  |
| :---: | :----------------: | :-------: |
| Admin | admin@underpass.com| password  |
| Organizer | organizer@test.com | password |
| Clubber  | clubber@test.com  | password  |

## 🚧 Upcoming Improvements

- Push Notifications for verified events.
- Points Marketplace to exchange points for benefits.
- Enhanced Organizer Dashboard with historical Vibechecks data.

## 🎨 Credits

Developed by **Franco Bridarolli** - 2026.
