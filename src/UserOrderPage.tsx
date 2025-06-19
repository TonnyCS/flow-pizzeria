import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, addDoc, query, where, onSnapshot, doc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Card, CardContent, CircularProgress, Alert, Chip, Stack, Snackbar, useTheme } from '@mui/material';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Pizza {
  id: string;
  name: string;
  ingredients: string[];
  isAvailable?: boolean;
}

interface Order {
  id: string;
  pizzaId: string;
  userName: string;
  orderIdentifier: string;
  status: string;
  createdAt: Date;
}

const statusColors: Record<string, { label: string; color: 'warning' | 'success' | 'default' }> = {
  in_progress: { label: 'In Progress', color: 'warning' },
  completed: { label: 'Ready for Pickup', color: 'success' },
};

const isIos = () => {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
};
const isAndroid = () => {
  return /android/i.test(window.navigator.userAgent);
};

const generateOrderIdentifier = (userName: string): string => {
  const storedIdentifier = localStorage.getItem('orderIdentifier');
  if (storedIdentifier) {
    const [storedName, id] = storedIdentifier.split('-');
    if (storedName === userName) {
      return storedIdentifier;
    }
  }
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newIdentifier = `${userName}-${randomId}`;
  localStorage.setItem('orderIdentifier', newIdentifier);
  localStorage.setItem('userName', userName);
  return newIdentifier;
};

const UserOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPizza, setSelectedPizza] = useState<string>('');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [orderLoading, setOrderLoading] = useState(false);
  const [userOrder, setUserOrder] = useState<Order | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const prevStatus = useRef<string | null>(null);
  const [showReadyAlert, setShowReadyAlert] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const unsubPizzas = onSnapshot(collection(db, 'pizzas'), (snapshot) => {
      try {
        const pizzaList: Pizza[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Pizza[];
        setPizzas(pizzaList);
        
        // If currently selected pizza becomes unavailable, deselect it
        const selectedPizzaData = pizzaList.find(p => p.id === selectedPizza);
        if (selectedPizza && selectedPizzaData?.isAvailable === false) {
          setSelectedPizza('');
          setError('The selected pizza is no longer available.');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load pizza menu.');
        setLoading(false);
      }
    });

    // Listen for shop status
    const unsubShopStatus = onSnapshot(doc(db, 'settings', 'shopStatus'), (doc) => {
      if (doc.exists()) {
        setIsShopOpen(doc.data().isOpen);
      }
    }, () => setError('Failed to load shop status.'));

    return () => {
      unsubPizzas();
      unsubShopStatus();
    };
  }, [selectedPizza]);

  useEffect(() => {
    if (!userName) {
      setUserOrder(null);
      return;
    }

    const orderIdentifier = generateOrderIdentifier(userName);
    const q = query(collection(db, 'orders'), where('orderIdentifier', '==', orderIdentifier));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      const activeOrder = orders.find(o => o.status === 'in_progress' || o.status === 'completed');
      setUserOrder(activeOrder || null);
      
      if (activeOrder && prevStatus.current && prevStatus.current !== activeOrder.status && activeOrder.status === 'completed') {
        if (Notification.permission === 'granted') {
          new Notification('Your pizza is ready for pickup!');
        } else {
          setShowReadyAlert(true);
        }
      }
      prevStatus.current = activeOrder ? activeOrder.status : null;
    });
    
    return () => unsub();
  }, [userName]);

  // Add new useEffect for queue count
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('status', '==', 'in_progress'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueueCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const handleOrder = async () => {
    if (!selectedPizza || !userName || !isShopOpen) return;
    
    const selectedPizzaData = pizzas.find(p => p.id === selectedPizza);
    if (!selectedPizzaData || selectedPizzaData.isAvailable === false) {
      setError('Sorry, this pizza is no longer available.');
      setSelectedPizza('');
      return;
    }

    setOrderLoading(true);
    try {
      const orderIdentifier = generateOrderIdentifier(userName);
      await addDoc(collection(db, 'orders'), {
        pizzaId: selectedPizza,
        userName,
        orderIdentifier,
        status: 'in_progress',
        createdAt: new Date(),
      });
      setOrderSuccess(true);
      setSelectedPizza('');
    } catch (err) {
      setError('Failed to place order.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUserNameChange = (newName: string) => {
    setUserName(newName);
    if (newName) {
      localStorage.setItem('userName', newName);
    } else {
      localStorage.removeItem('userName');
      localStorage.removeItem('orderIdentifier');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ pb: 20 }}>
      {!isShopOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Sorry, we're currently closed. Please come back later!
        </Alert>
      )}
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={2}>
        <Typography variant="h5" gutterBottom fontWeight={700} textAlign="center">
          Order a Pizza
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Current Queue: ${queueCount} ${queueCount === 1 ? 'Pizza' : 'Pizzas'}`}
            color={queueCount > 5 ? 'warning' : 'default'}
            sx={{
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? queueCount > 5 ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                : undefined,
              '& .MuiChip-label': {
                px: 2,
              }
            }}
          />
          <Chip
            label={`Estimated Wait: ${queueCount <= 1 ? '< 3' : queueCount * 3} mins`}
            color={queueCount > 8 ? 'warning' : 'default'}
            sx={{
              fontWeight: 600,
              background: theme.palette.mode === 'dark'
                ? queueCount > 8 ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                : undefined,
              '& .MuiChip-label': {
                px: 2,
              }
            }}
          />
        </Stack>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {userOrder ? (
          <Card elevation={4} sx={{ 
            borderRadius: 3, 
            border: '2px solid',
            borderColor: theme.palette.mode === 'dark' 
              ? userOrder.status === 'completed' 
                ? 'rgba(76, 175, 80, 0.5)' 
                : 'rgba(0, 179, 136, 0.5)' 
              : userOrder.status === 'completed'
                ? '#4caf50'
                : '#00b388',
            background: theme.palette.mode === 'dark' 
              ? userOrder.status === 'completed'
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(0, 179, 136, 0.1)'
              : userOrder.status === 'completed'
                ? '#e8f5e9'
                : '#e6f7f3',
            p: 2,
            transition: 'all 0.3s ease'
          }}>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  {userOrder.status === 'in_progress' ? (
                    <Box position="relative" display="flex" alignItems="center" justifyContent="center" sx={{ width: 40, height: 40 }}>
                      <CircularProgress
                        size={40}
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#33c3a0' : '#00b388',
                          position: 'absolute'
                        }}
                      />
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#33c3a0' : '#00b388',
                          fontWeight: 700
                        }}
                      >
                        {queueCount}
                      </Typography>
                    </Box>
                  ) : (
                    <CheckCircleIcon 
                      sx={{ 
                        fontSize: 40,
                        color: theme.palette.mode === 'dark' ? '#66bb6a' : '#4caf50'
                      }} 
                    />
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? userOrder.status === 'completed' 
                          ? '#66bb6a' 
                          : '#33c3a0' 
                        : userOrder.status === 'completed'
                          ? '#4caf50'
                          : '#00b388'
                    }}>
                      {userOrder.status === 'in_progress' ? 'Preparing Your Pizza' : 'Ready for Pickup'}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {pizzas.find(p => p.id === userOrder.pizzaId)?.name || 'Pizza'}
                    </Typography>
                  </Box>
                </Box>

                <Stack 
                  direction="row" 
                  spacing={1} 
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {userOrder.orderIdentifier}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      icon={userOrder.status === 'in_progress' ? <AccessTimeIcon /> : <CheckCircleIcon />}
                      label={statusColors[userOrder.status]?.label || userOrder.status} 
                      color={userOrder.status === 'completed' ? 'success' : 'warning'}
                      variant="filled"
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        background: theme.palette.mode === 'dark'
                          ? userOrder.status === 'completed'
                            ? 'rgba(76, 175, 80, 0.2)'
                            : 'rgba(255, 152, 0, 0.2)'
                          : undefined,
                        '& .MuiChip-icon': {
                          fontSize: '1rem'
                        }
                      }} 
                    />
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <>
            {pizzas.map(pizza => (
              <Card
                key={pizza.id}
                elevation={selectedPizza === pizza.id ? 8 : 2}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: selectedPizza === pizza.id 
                    ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.5)' : '#00b388'
                    : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee',
                  boxShadow: selectedPizza === pizza.id 
                    ? theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 4
                    : theme.palette.mode === 'dark' ? '0 2px 10px rgba(0, 0, 0, 0.3)' : 1,
                  transition: 'all 0.2s ease',
                  cursor: pizza.isAvailable === false ? 'not-allowed' : 'pointer',
                  background: selectedPizza === pizza.id
                    ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#e6f7f3'
                    : pizza.isAvailable === false
                    ? theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.1)' : '#f5f5f5'
                    : theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
                  opacity: pizza.isAvailable === false ? 0.7 : 1,
                  '&:hover': pizza.isAvailable === false ? {} : {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.7)' : '#00b388',
                    background: selectedPizza === pizza.id
                      ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.2)' : '#d9f2ec'
                      : theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.05)' : '#f0faf7'
                  }
                }}
                onClick={() => pizza.isAvailable !== false && setSelectedPizza(pizza.id)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>{pizza.name}</Typography>
                    {pizza.isAvailable === false && (
                      <Chip 
                        label="Unavailable" 
                        color="error" 
                        size="small"
                        sx={{
                          background: theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.2)' : undefined
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">{pizza.ingredients.join(', ')}</Typography>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Box>

      {!userOrder && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0px -2px 20px rgba(0, 0, 0, 0.5)' 
              : '0px -2px 10px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 'sm',
            margin: '0 auto',
            zIndex: 1000,
          }}
        >
          <TextField
            label="Your Name"
            value={userName}
            onChange={e => handleUserNameChange(e.target.value)}
            fullWidth
            disabled={!isShopOpen || userOrder !== null}
            sx={{ 
              borderRadius: 3,
              '& .MuiOutlinedInput-root': {
                background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              borderRadius: 3, 
              fontWeight: 700, 
              py: 1.5, 
              fontSize: '1.1rem', 
              boxShadow: 2, 
              background: '#00b388', 
              '&:hover': { 
                background: '#009e76' 
              },
              '&.Mui-disabled': {
                background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              }
            }}
            disabled={!selectedPizza || !userName || orderLoading || !isShopOpen}
            onClick={handleOrder}
          >
            {orderLoading ? <CircularProgress size={24} /> : isShopOpen ? 'Order' : 'Shop Closed'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={showReadyAlert}
        autoHideDuration={6000}
        onClose={() => setShowReadyAlert(false)}
        message="Your pizza is ready for pickup!"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default UserOrderPage; 