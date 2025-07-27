<<<<<<< HEAD

# DuesPay - University Payment Management

DuesPay is a web application designed to streamline the management of university dues and payments for both students and administrators. This project serves as a comprehensive Next.js starter application, showcasing various modern web development practices and integrations.

=======
# UniPay - University Payment Management

UniPay is a web application designed to streamline the management of university dues and payments for both students and administrators. This project serves as a comprehensive Next.js starter application, showcasing various modern web development practices and integrations.

>>>>>>> 923e8ed64bfe9d9d199eb9217b02931b67089204
## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI
*   **AI Integration:** Genkit (for AI-powered features like payment reminders)
*   **State Management:** React Context API (`AuthContext`, `DuesContext`)
*   **Form Handling:** React Hook Form with Zod for validation
*   **Utilities:** Lucide Icons, date-fns, clsx, tailwind-merge, jsPDF

## Project Structure

A brief overview of important directories:

*   `src/app/`: Contains all pages, layouts, and route-specific components using the Next.js App Router.
    *   `src/app/admin/`: Admin-specific pages.
    *   `src/app/login/`: Login page.
    *   `src/app/payment-history/`: Student payment history page.
*   `src/components/`: Shared UI components used across the application.
    *   `src/components/ui/`: ShadCN UI components.
*   `src/contexts/`: React Context providers for global state management (`AuthContext`, `DuesContext`).
*   `src/ai/`: Genkit related files.
    *   `src/ai/flows/`: Genkit flows for AI functionalities.
    *   `src/ai/genkit.ts`: Genkit global instance configuration.
*   `src/lib/`: Utility functions, type definitions, schemas, and mock data.
*   `public/`: Static assets.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

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

Create a `.env` file in the root of the project. This file is used for environment-specific configurations, especially API keys for AI services.

Example `.env` content:

```env
# For Google AI Studio / Gemini models used with Genkit
# GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
```

Replace `YOUR_GOOGLE_AI_API_KEY` with your actual API key if you plan to use the AI features.

## Running the Application

1.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

2.  **Run the Genkit development server (for AI features):**
    Open a new terminal and run:
    ```bash
    npm run genkit:dev
    # or for auto-reloading on changes:
    npm run genkit:watch
    ```
    The Genkit server usually starts on `http://localhost:4000` by default and provides a development UI to inspect flows and prompts.

## Key Features

*   **Student Dues Dashboard:** View assigned dues, their status (Paid, Unpaid, Overdue), and details.
*   **Student Payment Simulation:** Students can "pay" for dues, updating their status.
*   **PDF Receipt Generation:** Students receive a downloadable PDF receipt after "payment."
*   **Student Payment History:** A dedicated page for students to view their past payments.
*   **Admin Panel:** Centralized dashboard for administrators.
*   **Admin Due Definition Management:** Admins can add new due definitions for school departments and remove existing ones.
*   **Admin View of Paid Students:** Admins can view a list of students who have paid for a specific due.
*   **AI-Powered Payment Reminder Generation:** Admins can use Genkit to generate personalized or general payment reminders.
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

## AI Features (Genkit)

The application uses Genkit to integrate AI functionalities, specifically for generating payment reminders.

*   **Reminder Flow (`src/ai/flows/generate-payment-reminder.ts`):**
    *   This server-side flow uses a Genkit prompt to generate reminder text based on input like due amount, due date, student name (optional), school, department, etc.
*   **Genkit Configuration (`src/ai/genkit.ts`):**
    *   Initializes the global `ai` object and configures plugins (e.g., `googleAI()`).
    *   Specifies the default model (e.g., `googleai/gemini-2.0-flash`).
*   **Admin Reminder Page (`src/app/admin/generate-reminder/page.tsx`):**
    *   Provides a form for admins to input details and trigger the AI reminder generation.
*   **Running Genkit:** Ensure the Genkit server (`npm run genkit:dev` or `npm run genkit:watch`) is running to use these AI features.

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
*   **`src/components/reminder-form.tsx`:** The form used by admins to generate AI payment reminders.
*   **`src/ai/flows/generate-payment-reminder.ts`:** The Genkit flow for the AI reminder feature.

## Future Enhancements (Potential Roadmap)

*   **Backend Integration:**
    *   Replace mock authentication with a real backend service (e.g., Firebase Authentication, custom JWT-based auth).
    *   Store user data, due definitions, and payment records in a persistent database (e.g., Firestore, PostgreSQL).
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

<<<<<<< HEAD
This README aims to provide a good starting point for developers working on or learning from the DuesPay application.
=======
This README aims to provide a good starting point for developers working on or learning from the UniPay application.
>>>>>>> 923e8ed64bfe9d9d199eb9217b02931b67089204
