# Student Union Election Application

A modern, secure, and real-time voting application designed for student union elections. This platform allows for the easy management of candidates and voters, secure casting of votes, and live monitoring of election results. Built with a React frontend and a Supabase backend.

## ✨ Features

-   **Admin Dashboard**: A central hub for managing the election.
-   **Candidate Management**: Easily add and delete candidates with names, photos, and positions.
-   **Voter Registration**: Bulk upload voters from an Excel (`.xlsx`) file, including names, registration numbers, and levels.
-   **Automatic PIN Generation**: Secure, 4-digit PINs are automatically generated for each voter upon registration.
-   **Downloadable Voter Lists**: Export the full list of registered voters with their generated PINs in PDF, Word, or Excel formats.
-   **Special Voter Mode**: A feature to register specific voters whose votes will carry a heavier weight (e.g., 30x).
-   **Secure Voting Portal**: A clean, intuitive interface for students to log in and cast their votes.
-   **Partial Voting**: Voters can choose to vote for as few as one candidate or for all positions.
-   **Live Results Page**: A real-time results dashboard for administrators, showing vote counts and percentages with progress bars.
-   **Election Controls**: Admins can start, stop, and restart the election from the dashboard.
-   **Discreet Results System**: A separate, password-protected system for a "Main Admin" to view and manually edit a secondary set of results for official announcements.

## 🚀 Tech Stack

-   **Frontend**: [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/))
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Backend-as-a-Service (BaaS)**: [Supabase](https://supabase.com/)
    -   **Database**: Supabase Postgres for data storage.
    -   **Serverless Functions**: Supabase Edge Functions for secure operations like casting votes.
-   **Deployment**: [Vercel](https://vercel.com/)
