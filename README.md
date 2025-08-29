---

# DuesPay - University Payment Management

DuesPay is a web application designed to streamline the management of university dues and payments for both students and administrators. This project serves as a comprehensive Next.js starter application, showcasing various modern web development practices and integrations.

---

## Table of Contents

*   [About the Project](#about-the-project)
*   [Tech Stack](#tech-stack)
*   [Project Structure](#project-structure)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Environment Variables](#environment-variables)
    *   [Running the Application](#running-the-application)
*   [Key Features](#key-features)
*   [Authentication (Mock Implementation)](#authentication-mock-implementation)
*   [State Management](#state-management)
*   [Styling](#styling)
*   [Important Files & Modules](#important-files--modules)
*   [Future Enhancements](#future-enhancements)
*   [Contributing](#contributing)

## About the Project

DuesPay is a web application designed to facilitate the management of university dues and payments. It provides interfaces for both students to view and manage their assigned dues and payment history, and for administrators to define dues and track payments.

This project serves as a starter template built with modern web technologies, demonstrating concepts such as:

*   Server-side rendering with Next.js App Router.
*   Component-based UI development with React.
*   Styling with Tailwind CSS and ShadCN UI.
*   State management using React Context API.
*   Form handling and validation.

**Note:** The current version utilizes mock data and a mock authentication system for demonstration purposes. A real backend integration is planned for future development.

## Tech Stack

The project is built using the following key technologies:

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI
*   **State Management:** React Context API (`AuthContext`, `DuesContext`)
*   **Form Handling:** React Hook Form with Zod for validation
*   **Utilities:** Lucide Icons, date-fns, clsx, tailwind-merge, jsPDF

For the planned backend development, the following technologies are intended to be used:

*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database ORM:** Sequelize
*   **Database:** PostgreSQL
*   **Authentication:** JWT, bcryptjs


## Project Structure

A brief overview of the project's directory structure:

*   `src/app/`: Contains all pages, layouts, and route-specific components using the Next.js App Router.
    *   `src/app/admin/`: Admin-specific pages.
    *   `src/app/login/`: Login page.
    *   `src/app/payment-history/`: Student payment history page.
*   `src/components/`: Shared UI components used across the application.
    *   `src/components/ui/`: ShadCN UI components.
*   `src/contexts/`: React Context providers for global state management (`AuthContext`, `DuesContext`).
*   `src/lib/`: Utility functions, type definitions, schemas, and mock data.
*   `public/`: Static assets (e.g., images).

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A PostgreSQL database instance (for future backend integration)

### Installation

1.  Clone the repository (if applicable, otherwise start with the existing project files).
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

Create a `.env` file in the root of the project (see `.env.example`).

Required for backend integration:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
```

### Running the Application

1.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

## Key Features

*   **Student Dues Dashboard:** View assigned dues, their status (Paid, Unpaid, Overdue), and details.
*   **Student Payment Simulation:** Students can "pay" for dues, updating their status.
*   **PDF Receipt Generation:** Students receive a downloadable PDF receipt after "payment."
*   **Student Payment History:** A dedicated page for students to view their past payments.
*   **Admin Panel:** Centralized dashboard for administrators.
*   **Admin Due Definition Management:** Admins can add new due definitions for school departments and remove existing ones.
*   **Admin View of Paid Students:** Admins can view a list of students who have paid for a specific due.
*   **Role-Based Authentication (Mocked):** Separate experiences for 'student' and 'admin' roles.
*   **Light/Dark Theme:** The application uses a light theme by default with support for dark mode styling (though a theme switcher is not yet implemented).

## Authentication (Mock Implementation)

Authentication is currently mocked for demonstration purposes:

*   **Login Page:** `/login` allows users to "log in" by providing any email/password and selecting a role ('student' or 'admin').
*   **`AuthContext` (`src/contexts/auth-context.tsx`):** Manages the current user's state (mocked user object).
    *   When students log in with specific email prefixes (e.g., `alice@example.com`), their `name` is mapped to a full name from `src/lib/mock-data.ts` (e.g., "Alice Wonderland") and they are assigned a predictable ID (`mock-student-alice`). This helps in linking payments to specific mock students.
*   **Protected Routes:** `AuthGuard` component in `src/components/auth-guard.tsx` protects routes based on authentication status and user role.
*   **Persistence:** User session is persisted in `localStorage`.

## State Management

*   **`AuthContext` (`src/contexts/auth-context.tsx`):** Manages user authentication state.
*   **`DuesContext` (`src/contexts/dues-context.tsx`):**
    *   Manages the list of `Due` definitions (e.g., tuition fees for a department).
    *   Manages `studentPayments`, an array tracking which student has paid which due.
    *   Provides functions to add/remove due definitions (admin) and record student payments.
*   **Persistence:** Due definitions and student payments (mock data) are persisted in `localStorage` to simulate a database across sessions.

## Styling

*   **ShadCN UI:** Leverages pre-built, accessible, and customizable components from `src/components/ui/`.
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   **Custom Theme:** Base color variables and theme settings are defined in `src/app/globals.css`. The application defaults to a light theme.

## Important Files & Modules

*   **`src/app/layout.tsx`:** The root layout for the application, including global providers.
*   **`src/app/page.tsx`:** The main Dues Dashboard page for students and admins.
*   **`src/contexts/auth-context.tsx`:** Manages authentication state.
*   **`src/contexts/dues-context.tsx`:** Manages dues and payment data.
*   **`src/lib/mock-data.ts`:** Defines core data structures (like `Due`, `StudentPayment`), initial mock data, and helper functions for mock user data.
*   **`src/components/due-card.tsx`:** Displays individual due items and handles payment/admin actions.

## Future Enhancements (Potential Roadmap)

*   **Backend Integration:**
    *   App now supports token-based login and API-driven dues/payments when `NEXT_PUBLIC_API_BASE_URL` is set.
    *   Replace the development fallback fully by providing a production backend implementing these endpoints:
        - `POST /auth/login` -> `{ token, user }`
        - `GET /auth/me` -> `user`
        - `GET /dues` -> `Due[]`
        - `POST /dues` -> `Due`
        - `DELETE /dues/:id`
        - `GET /dues/:id/payments` -> `StudentPayment[]`
        - `POST /dues/:id/pay` -> `StudentPayment`
*   **Real Payment Gateway Integration:**
    *   Integrate with services like Paystack, Flutterwave, or Stripe to process actual payments.
*   **Student Profile Management:** Allow students to view and manage their profile information.
*   **Advanced Admin Features:**
    *   More detailed reporting and analytics.
    *   Bulk due assignment.
    *   User management.
*   **Notifications:** Implement in-app or email notifications for new dues, payment confirmations, and reminders.
*   **Theme Switcher:** Allow users to toggle between light and dark modes.

## Contributing

Contributions are welcome! Please follow standard coding practices. Ensure code is linted and type-checked before submitting changes.

*   **Linting:** `npm run lint`
*   **Type Checking:** `npm run typecheck`

---

This README aims to provide a good starting point for developers working on or learning from the DuesPay application.
