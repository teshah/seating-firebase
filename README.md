# Firebase Studio - Jaanvi's Sweet Seats

This is a Next.js starter project for "Jaanvi's Sweet Seats", an application to help manage event seating arrangements.

## Getting Started

To get started with the application:

1.  **Install Dependencies:**
    If you haven't already, install the necessary Node.js packages. Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    To start the Next.js development server, run:
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:9002`. The `-p 9002` flag in the script specifies port 9002. If that port is in use, Next.js might choose another available port. Check your terminal output for the exact address.

3.  **View the Application:**
    Open your web browser and navigate to the address provided in the terminal (e.g., `http://localhost:9002`).

## Project Structure

-   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
    -   `src/app/page.tsx`: The main homepage component.
    -   `src/app/layout.tsx`: The root layout for the application.
    -   `src/app/globals.css`: Global stylesheets and Tailwind CSS theme customizations.
-   `src/components/`: Contains reusable React components.
    -   `src/components/ui/`: ShadCN UI components.
    -   `src/components/layout/`: Layout-specific components like the header.
    -   `src/components/seating-chart-display.tsx`: Component for displaying the seating chart.
    -   `src/components/table-card.tsx`: Component for displaying individual table cards.
-   `src/lib/`: Contains utility functions and library-related code.
    -   `src/lib/sample-data.ts`: Generates sample seating data.
    -   `src/lib/utils.ts`: General utility functions, including `cn` for class names.
-   `src/types/`: Contains TypeScript type definitions.
    -   `src/types/seating.ts`: Defines types for guests, tables, and seating chart data.
-   `src/ai/`: Contains Genkit related AI flows and configurations (if AI features are implemented).
    - `src/ai/genkit.ts`: Genkit initialization.
    - `src/ai/dev.ts`: Genkit development server entry point.
-   `public/`: Static assets that are served directly.
-   `next.config.ts`: Next.js configuration file.
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `components.json`: ShadCN UI configuration.
-   `package.json`: Project dependencies and scripts.

## Available Scripts

-   `npm run dev`: Starts the Next.js development server (with Turbopack on port 9002).
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server (after running `npm run build`).
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
-   `npm run typecheck`: Runs TypeScript to check for type errors.
-   `npm run genkit:dev`: Starts the Genkit development server (if you are working with AI features).
-   `npm run genkit:watch`: Starts the Genkit development server with watch mode.

## Key Features

-   Displays a seating chart with tables and guest lists.
-   Search functionality to find guests or tables.
-   Upload CSV file (`Name,Table` format) to populate/update the seating chart.
-   Download current seating assignments as a CSV file.
-   Table headers feature background images (currently placeholders from Picsum Photos, themed around the Seven Wonders of the World via `data-ai-hint`).

This should help you get the application running on your local machine!
