# Flow Pizzeria

A real-time pizza ordering system built with React, TypeScript, and Firebase.

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

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/flow-pizzeria.git
cd flow-pizzeria
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase
- Create a new Firebase project
- Enable Firestore
- Add your Firebase configuration to `src/firebase.ts`

4. Start the development server
```bash
npm start
```

## Usage

### Customer View
- Browse available pizzas
- Place orders
- Track order status in real-time
- View estimated wait times

### Admin View
- Access admin dashboard at `/admin` (code: flow-mio)
- Manage pizza availability
- Update order statuses
- Toggle shop open/close status

## License

MIT License - feel free to use this code for your own projects! 