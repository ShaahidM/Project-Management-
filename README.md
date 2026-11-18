# Project Management Tool

A web-based, Scrum-style project management tool built as an in-house alternative to costly commercial products. It supports multi-user teams and covers the full agile workflow: product backlog, sprint planning, a sprint board, and team administration.

> Built as a team project for Monash University's FIT2101 (Software Engineering Processes and Management), developed over agile sprints.

## Features

- **Product backlog** – create, edit, delete, filter and sort tasks by priority, story points, type and tags.
- **Sprint management** – create sprints, assign backlog tasks to them, and track them on a drag-and-drop sprint board (Not Started / In Progress / Completed), with a list view alternative.
- **Task detail and history** – per-task description, assignee, tags, and a change history log.
- **Time tracking and charts** – log contribution time per task, with a sprint burndown chart and per-member contribution graphs.
- **Team administration** – an admin dashboard for adding, editing and removing members, and viewing each member's contribution data.
- **Login** – member authentication, plus light and dark mode.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript, [Tailwind CSS](https://tailwindcss.com/) |
| UI components | React 18 and [Ant Design](https://ant.design/) (sprint form) |
| Build | Webpack 5, Babel |
| Backend / hosting | Firebase (Firestore, Hosting) |

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) 18 or later.

```bash
git clone https://github.com/ShaahidM/Project-Management-.git
cd Project-Management-
npm install

npm run build      # compile Tailwind CSS into public/tailwind-output.css
npm run build:js   # bundle the React sprint form into public/dist/bundle.js
```

Then serve the `public/` folder with any static server, for example:

```bash
npx serve public
```

and open `login.html`.

### Using your own Firebase project

The app reads and writes data in Cloud Firestore. To run it against your own backend, create a Firebase project, enable Firestore, and replace the `firebaseConfig` object at the top of [`public/script.js`](public/script.js) (and in `public/login.html`) with your project's web config. Update `.firebaserc` and deploy with `firebase deploy --only hosting`.

## Project structure

```
public/
  index.html        main application shell (backlog, sprint board, admin dashboard)
  login.html        login page
  script.js         application logic and Firestore access
  sprintform.js     React / Ant Design sprint form (bundled by Webpack)
  style.css         application styles
  dist/             Webpack output
src/input.css       Tailwind entry point
```

## Known limitations

This was a coursework project, so some shortcuts were taken that should be addressed before any real-world use:

- Member passwords are stored as plain text in Firestore. A production version should use Firebase Authentication or salted password hashing.
- Firestore security rules should be locked down; the client currently has broad access.
- There are no automated tests.

## Team

Developed by Team 4 (Wednesday 4:30pm lab), FIT2101, Monash University.
