# 💈 Barbershop Booking System

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/tech-Next.js%2C_TypeScript%2C_PostgreSQL-informational)

## 📖 About the Project

**Barbershop Project** is a full-featured web application for booking barber services.  
Users can browse various barbershops in a region, view available services such as haircut, beard trim, pedicure, massage, and hair hydration, and schedule appointments at specific dates and times.  

Key features include:  

- Google login authentication  
- Appointments stored securely in a **PostgreSQL database (Neon DB)**  
- Prevents double booking: a user cannot schedule the same service at the same time and day  
- Search for specific barbershops or services  
- Page for viewing all completed and confirmed appointments  

This project is built using **Next.js**, **TypeScript**, and a modern full-stack architecture to provide a robust and scalable booking system.

🔗 **Access the live project:** [Click here](https://barbershop-project-1gw7ss5eb-alex-pedrosos-projects.vercel.app/)  
📂 **GitHub repository:** [Click here](https://github.com/AlexWalkerGD/barbershop-project)

---

## 🖼️ Preview

<table>
  
  <tr>
    <td><img width="300" height="675" alt="Captura de tela 2025-10-19 005202" src="https://github.com/user-attachments/assets/4874a885-21c8-4916-85a1-2168d69e59ec" /></td>
    <td><img width="300" height="675" alt="Captura de tela 2025-10-19 005211" src="https://github.com/user-attachments/assets/0ba8d8ae-6b30-4020-9c48-09f47924b40f" /></td>
    <td><img width="300" height="675" alt="Captura de tela 2025-10-19 005223" src="https://github.com/user-attachments/assets/141de903-d48f-4ad8-b8a0-cb42efab176b" /></td>
  </tr>
  <tr>
    <td><img width="300" height="675" alt="Captura de tela 2025-10-19 005319" src="https://github.com/user-attachments/assets/ae2eb7d8-7835-480b-ae1c-cacae2443189" /></td>
    <td><img width="300" height="675" alt="Captura de tela 2025-10-19 005334" src="https://github.com/user-attachments/assets/be53f3e0-a66e-4e25-8a67-3e02b779bd3c" /></td>
    <td><img width="300" height="675" alt="image" src="https://github.com/user-attachments/assets/c94fcd6f-fd58-4adf-8150-9946f16b77e8" /></tr>

  </tr>
</table>

---

## 🚀 Features

- 🔑 User authentication with Google
- 🏪 Browse barbershops and view available services
- 📅 Schedule appointments for specific dates and times
- ⛔ Prevent double-booking for the same service/time
- 🔍 Search functionality for barbershops and services
- ✅ View confirmed and completed appointments
- ⚡ Responsive and modern UI design

---

## 🛠️ Technologies and Libraries Used

### Frameworks and Languages
- Next.js (React framework for SSR and SSG)
- TypeScript (typed JavaScript)
- HTML5 & CSS3
- JavaScript (ES6+)
  
### Styling
- Tailwind CSS (utility-first CSS framework)
- Shadcn/UI (components library)
- Lucide-react (icons)
- Framer Motion (animations)

### State Management and API
- React Query / SWR (for data fetching and caching)
- Axios (HTTP requests)
- NextAuth.js (Google authentication)

### Database
- PostgreSQL (Neon DB)
- Prisma ORM (database modeling and queries)

### Utilities

- date-fns (date formatting and localization)
- Zod (data validation)

### Deployment
- Vercel (hosting and deployment)

---

## ⚙️ How to Run Locally

1. Clone this repository:

    ```bash
    git clone https://github.com/AlexWalkerGD/barbershop-project.git
    ```

2. Access the project folder:

    ```bash
   cd barbershop-project
    ```


3. Install dependencies:

    ```bash
   npm install
    ```


4. Create a .env file in the root with the following variables:
  
    ```bash
    DATABASE_URL=postgresql://username:password@host:port/dbname
    NEXTAUTH_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    NEXTAUTH_SECRET=your_nextauth_secret
     ```


5. Run database migrations:

    ```bash
   npx prisma migrate dev
    ```


6. Start the development server:

   ```bash
    npm run dev
   ```

7. Open your browser and access:
  
    ```bash
     http://localhost:3000
     ```

---

👨‍💻 Author

Developed by **Alex Walker**

💼 [GitHub](https://github.com/AlexWalkerGD)  
📧 alexwalkerson@hotmail.com

---

🪪 License

This project is licensed under the MIT License.
Feel free to use, modify, and distribute it as you wish.

