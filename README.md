# Flow Pizzeria

A real-time pizza ordering system built with React, TypeScript, and Firebase. This project was developed with the assistance of Cursor AI, providing intelligent code suggestions and pair programming capabilities.

## Features

- **Real-time Order Updates**: See order status changes instantly
- **Dark Mode Support**: Automatically adapts to system preferences with manual toggle
- **Queue Management**: Real-time queue tracking with estimated wait times
- **Admin Dashboard**: Manage orders and pizza availability
- **Persistent Order Tracking**: Keep track of orders even after page refresh
- **Mobile-Friendly Design**: Works great on all devices

## Tech Stack

- React
- TypeScript
- Firebase (Firestore)
- Material-UI
- React Router

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Getting Started

1. Clone the repository
```bash
# Windows
git clone https://github.com/YOUR_USERNAME/flow-pizzeria.git
cd flow-pizzeria

# Mac/Linux
git clone https://github.com/YOUR_USERNAME/flow-pizzeria.git
cd flow-pizzeria
```

2. Install dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

3. Start the development server
```bash
# Using npm
npm start

# Using yarn
yarn start
```

The app will open in your default browser at `http://localhost:3000`

## Usage

### Customer View
- Browse available pizzas
- Place orders
- Track order status in real-time
- View estimated wait times

### Admin View
- Access admin dashboard at `/admin`
- Default admin code: `flow-mio`
- Manage pizza availability
- Update order statuses
- Toggle shop open/close status

## Development

### Windows
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Mac/Linux
```bash
# Make sure you have correct permissions
chmod +x node_modules/.bin/*

# Install dependencies
npm install

# Start development server
npm start
```

## Troubleshooting

### Mac/Linux
If you encounter permission issues:
```bash
# Fix node_modules permissions
sudo chown -R $(whoami) node_modules

# Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm
```

### Windows
If you encounter ENOENT errors:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Credits

- Built with [React](https://reactjs.org/)
- Styled with [Material-UI](https://mui.com/)
- Backend by [Firebase](https://firebase.google.com/)
- Developed with assistance from [Cursor](https://cursor.sh/), an AI-powered code editor

## License

MIT License - feel free to use this code for your own projects! 