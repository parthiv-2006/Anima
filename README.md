# 🥚 Evo Habit – Gamified Productivity Companion

> **"Your Tamagotchi for Productivity"**  
> transform your daily routines into an engaging journey of growth and evolution.


[Live Deployment](https://anima-client.vercel.app)

---

## 📖 About The Project

**Evo Habit** helps users build consistency by turning habit tracking into a game. Instead of just checking boxes, users care for a virtual pet that evolves based on their real-world productivity.

### ✨ Key Features

-   **🦖 Dynamic Pet Evolution**: Your pet grows and changes form based on your consistency. Neglect your habits, and your pet's health decays.
-   **📊 Interactive Habit Tracking**: Create, track, and complete daily habits with satisfying interactions and animations.
-   **🛍️ Virtual Economy**: Earn coins by completing tasks to buy food, elixirs, and backgrounds in the in-game shop.
-   **📈 Visual Analytics**: Track your completion history and productivity trends with beautiful charts.
-   **🔐 Secure Authentication**: Full user registration and login system with JWT security.

---

## 🛠️ Technology Stack

Built with the **MERN** stack, focusing on performance, scalability, and a premium user experience.

### Frontend
-   **Framework**: React (Vite)
-   **State Management**: Zustand
-   **Styling**: TailwindCSS
-   **Animations**: Framer Motion & Lottie Files
-   **Data Visualization**: Recharts
-   **Icons**: Lucide React

### Backend
-   **Runtime**: Node.js & Express
-   **Database**: MongoDB & Mongoose
-   **Authentication**: JWT & Bcrypt
-   **Security**: Helmet, Rate Limiting, XSS-Clean

---


## 🚀 Getting Started Locally

Follow these steps to set up the project locally on your machine.

### Prerequisites
-   Node.js (v18+)
-   npm over yarn
-   MongoDB URI

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/parthiv-2006/Anima.git
    cd Anima
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGODB_URI=[YOUR_MONGODB_CONNECTION_STRING]
    JWT_SECRET=[YOUR_SECRET_KEY]
    JWT_EXPIRE=30d
    NODE_ENV=development
    CLIENT_URL=http://localhost:5173
    ```

    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

4.  **Run the App**
    Start both the client and server concurrently:
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

```bash
Anima/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── state/          # Global state (Zustand)
│   │   └── services/       # API integration
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # Database schemas
│   │   └── routes/         # API endpoints
```

---

## 🤝 Contact & Acknowledgements

**Parthiv Paul**  
-   [LinkedIn](www.linkedin.com/in/parthiv-paul)
-   [GitHub](https://github.com/parthiv-2006)
-   Email: parthiv.paul5545@gmail.com

*Created as a personal project to explore gamification in productivity tools.*