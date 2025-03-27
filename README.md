# Romanian Whist Scorekeeper

A responsive web application for keeping score in Romanian Whist card games.

## Features

- Create and manage Romanian Whist games with 3-6 players
- Track player predictions and actual tricks won
- Automatic score calculation based on Romanian Whist rules
- Real-time scoreboard updates
- Support for game progression through multiple rounds
- Mobile-friendly design
- Auto-suggestion for previously used player names
- Final rankings and game statistics

## Game Rules

Romanian Whist is a trick-taking card game that follows these basic rules:

- Players predict how many tricks they'll win at the start of each round
- The sum of all predictions cannot equal the total tricks available
- Correct predictions earn 5 points plus the number of tricks won
- Incorrect predictions result in a penalty equal to the difference between prediction and actual tricks

For full rules, see the in-app rules modal.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/whist-score-keeper.git
   cd whist-score-keeper
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow**: Runs on every PR and push to the main branch, performing:
  - Type checking with TypeScript
  - Unit tests with Jest
  - Building the application
  
- **Code Quality Checks**: Automatically checks:
  - ESLint for code quality rules
  - Prettier for code formatting
  
- **Deployment**: Automatically deploys to GitHub Pages when code is pushed to the main branch

### Status Badges

[![CI/CD Pipeline](https://github.com/yourusername/whist-score-keeper/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/whist-score-keeper/actions/workflows/ci.yml)
[![Code Quality](https://github.com/yourusername/whist-score-keeper/actions/workflows/code-quality.yml/badge.svg)](https://github.com/yourusername/whist-score-keeper/actions/workflows/code-quality.yml)
[![Deploy to GitHub Pages](https://github.com/yourusername/whist-score-keeper/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/whist-score-keeper/actions/workflows/deploy.yml)

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- Context API for state management
- Local Storage for game persistence

## License

This project is licensed under the MIT License - see the LICENSE file for details.
