# Flow Pizzeria - Development Notes

This document captures the development decisions, features, and implementation details for the Flow Pizzeria project. This project was developed with assistance from Cursor AI, providing intelligent code suggestions and pair programming capabilities.

## Project Overview

**Flow Pizzeria** is a real-time pizza ordering system built with React, TypeScript, and Firebase. The application provides both customer-facing ordering capabilities and admin management features.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) with custom theming
- **Backend**: Firebase Firestore for real-time data
- **State Management**: React hooks with Firebase real-time listeners
- **Routing**: React Router v6
- **Styling**: MUI's sx prop with custom CSS-in-JS
- **Development**: Cursor AI for pair programming assistance

## Key Features Implemented

### 1. Real-Time Order System
- **Queue Management**: Real-time queue counter showing current orders
- **Wait Time Estimates**: 3 minutes per pizza calculation
- **Order Status Tracking**: Real-time updates for order status changes
- **Persistent Orders**: Orders persist across page refreshes using localStorage

### 2. User Experience Features
- **Dark Mode Support**: Automatic system preference detection with manual toggle
- **Mobile-Friendly Design**: Responsive design that works on all devices
- **Order Cards**: Visual order tracking with status indicators
- **Circular Progress**: Queue position indicator with progress visualization

### 3. Admin Management System
- **Authentication**: Admin code system ("flow-mio") with persistent login
- **Pizza Management**: Add/remove pizzas with edit mode toggle
- **Order Management**: Real-time order status updates
- **Shop Status**: Toggle shop open/close functionality

### 4. Data Persistence
- **localStorage Integration**: User names and order identifiers persist
- **Unique Order IDs**: Combination of username and random string
- **Firebase Real-time**: Live updates across all connected clients

## Implementation Details

### Order Persistence System
```typescript
// Order identification combines username with random string
const orderIdentifier = `${userName}-${Math.random().toString(36).substr(2, 9)}`;

// localStorage keys
localStorage.setItem('userName', userName);
localStorage.setItem('orderIdentifier', orderIdentifier);
```

### Queue and Wait Time Calculation
```typescript
// Wait time calculation: 3 minutes per pizza
const totalPizzas = order.pizzas.reduce((sum, pizza) => sum + pizza.quantity, 0);
const estimatedWaitTime = totalPizzas * 3;

// Display logic
const waitTimeText = estimatedWaitTime <= 3 ? "< 3 mins" : `${estimatedWaitTime} mins`;
```

### Admin Authentication
```typescript
// Admin code validation
const ADMIN_CODE = "flow-mio";
const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

// Persistent authentication
localStorage.setItem('adminAuthenticated', 'true');
```

### Pizza Management System
```typescript
// Edit mode toggle for pizza management
const [editMode, setEditMode] = useState(false);

// Add new pizza with default availability
await addDoc(collection(db, 'pizzas'), {
  name: newPizza.name.trim(),
  ingredients: ingredients.split(',').map(i => i.trim()),
  isAvailable: true // Default to available
});
```

## Database Structure

### Firestore Collections

#### `pizzas`
```typescript
interface Pizza {
  id: string;
  name: string;
  ingredients: string[];
  isAvailable: boolean;
}
```

#### `orders`
```typescript
interface Order {
  id: string;
  userName: string;
  orderIdentifier: string;
  pizzas: Array<{
    name: string;
    quantity: number;
  }>;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timestamp: Timestamp;
  totalPizzas: number;
}
```

#### `shopStatus`
```typescript
interface ShopStatus {
  isOpen: boolean;
  lastUpdated: Timestamp;
}
```

## UI/UX Decisions

### Design Philosophy
- **Clean and Modern**: Minimalist design with clear visual hierarchy
- **Dark Mode First**: Comprehensive dark mode support with proper contrast
- **Responsive**: Mobile-first approach with desktop enhancements
- **Accessibility**: Proper contrast ratios and keyboard navigation

### Color Scheme
- **Primary**: Green (#00b388) for success/available states
- **Error**: Red (#ff5252) for unavailable/error states
- **Background**: Adaptive based on theme (light/dark)
- **Text**: High contrast ratios for readability

### Animation Strategy
- **Subtle Transitions**: 0.2s ease transitions for interactions
- **Hover Effects**: Gentle lift effects on interactive elements
- **Loading States**: Circular progress indicators
- **Status Changes**: Smooth transitions between states

## File Structure

```
src/
├── App.tsx                 # Main application component
├── AdminDashboard.tsx      # Admin dashboard with navigation
├── PizzaManagement.tsx     # Pizza CRUD operations
├── UserOrderPage.tsx       # Customer ordering interface
├── firebase.ts            # Firebase configuration
├── theme/
│   └── ThemeContext.tsx   # Dark/light mode context
├── types/                 # TypeScript type definitions
└── i18n/                  # Internationalization (future)
```

## Key Components

### AdminDashboard.tsx
- Navigation hub for admin functions
- Shop status toggle
- Order management interface
- Real-time order updates

### PizzaManagement.tsx
- Edit mode toggle for pizza management
- Add/remove pizza functionality
- Availability toggle for existing pizzas
- Ingredient display with chips

### UserOrderPage.tsx
- Customer ordering interface
- Real-time queue updates
- Order tracking with visual indicators
- Persistent order management

## Development Workflow

### Iterative Development Process
1. **Feature Planning**: Define requirements and user stories
2. **Implementation**: Build features with Cursor AI assistance
3. **Testing**: Manual testing of functionality
4. **Refinement**: UI/UX improvements based on testing
5. **Documentation**: Update notes and comments

### Code Quality Standards
- **TypeScript**: Strict typing for all components
- **Component Structure**: Functional components with hooks
- **Error Handling**: Comprehensive error states and user feedback
- **Performance**: Efficient re-renders and Firebase listeners

## Future Enhancements

### Planned Features
- **Internationalization**: Multi-language support
- **Payment Integration**: Online payment processing
- **Order History**: Customer order history tracking
- **Analytics**: Sales and order analytics
- **Push Notifications**: Real-time order updates

### Technical Improvements
- **Testing**: Unit and integration tests
- **Performance**: Code splitting and lazy loading
- **SEO**: Meta tags and structured data
- **PWA**: Progressive web app features

## Troubleshooting Common Issues

### Firebase Connection
- Ensure Firebase project is properly configured
- Check Firestore rules for read/write permissions
- Verify API keys in environment variables

### Real-time Updates
- Firebase listeners properly cleaned up in useEffect
- Error handling for network disconnections
- Fallback states for loading/error conditions

### localStorage Issues
- Check browser compatibility
- Handle quota exceeded errors
- Provide fallbacks for private browsing

## Deployment Notes

### Environment Variables
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Build Process
```bash
npm run build
npm start
```

## Credits

- **Built with**: React, TypeScript, Firebase
- **UI Framework**: Material-UI
- **Development Assistance**: Cursor AI
- **Real-time Backend**: Firebase Firestore

---

*This document serves as a comprehensive reference for the Flow Pizzeria project development. It captures the evolution of features, technical decisions, and implementation details that were developed through iterative collaboration with Cursor AI.* 