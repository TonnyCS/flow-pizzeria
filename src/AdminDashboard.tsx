import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { Box, Typography, Button, Card, CardContent, CircularProgress, Alert, Stack, Chip, FormControlLabel, Switch, useTheme } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';

interface Pizza {
  id: string;
  name: string;
  ingredients: string[];
}

interface Order {
  id: string;
  pizzaId: string;
  userName: string;
  orderIdentifier: string;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const statusColors: Record<string, { label: string; color: 'warning' | 'success' | 'default' }> = {
  in_progress: { label: 'In Progress', color: 'warning' },
  completed: { label: 'Ready for Pickup', color: 'success' },
  picked_up: { label: 'Picked Up', color: 'default' },
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pizzas, setPizzas] = useState<Record<string, Pizza>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isShopOpen, setIsShopOpen] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);

    // Listen for shop status
    const unsubShopStatus = onSnapshot(doc(db, 'settings', 'shopStatus'), (doc) => {
      if (doc.exists()) {
        setIsShopOpen(doc.data().isOpen);
      } else {
        // Initialize shop status if it doesn't exist
        setDoc(doc.ref, { isOpen: true });
      }
    }, () => setError('Failed to load shop status.'));

    const unsubPizzas = onSnapshot(collection(db, 'pizzas'), (pizzaSnapshot) => {
      const pizzaMap: Record<string, Pizza> = {};
      pizzaSnapshot.docs.forEach(docSnap => {
        pizzaMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as Pizza;
      });
      setPizzas(pizzaMap);
    }, () => setError('Failed to load pizzas.'));

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
    const unsubOrders = onSnapshot(ordersQuery, (orderSnapshot) => {
      const orderList: Order[] = orderSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Order[];
      setOrders(orderList);
      setLoading(false);
    }, () => {
      setError('Failed to load orders.');
      setLoading(false);
    });

    return () => {
      unsubShopStatus();
      unsubPizzas();
      unsubOrders();
    };
  }, []);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (newStatus === 'picked_up') {
      await deleteDoc(doc(db, 'orders', order.id));
      setOrders(orders => orders.filter(o => o.id !== order.id));
    } else {
      await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
      setOrders(orders => orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    }
  };

  const toggleShopStatus = async () => {
    try {
      await setDoc(doc(db, 'settings', 'shopStatus'), { isOpen: !isShopOpen });
      setIsShopOpen(!isShopOpen);
    } catch (err) {
      setError('Failed to update shop status.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Pizza Queue
        </Typography>
        <Button
          variant="outlined"
          startIcon={<LocalPizzaIcon />}
          onClick={() => navigate('/admin/pizzas')}
          sx={{ 
            borderRadius: 3, 
            fontWeight: 600, 
            borderColor: '#00b388', 
            color: '#00b388',
            '&:hover': { 
              borderColor: '#009e76', 
              background: theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#e6f7f3'
            }
          }}
        >
          Manage Pizzas
        </Button>
      </Box>

      <Card sx={{ 
        mb: 3, 
        p: 2, 
        borderRadius: 3, 
        background: isShopOpen 
          ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#e6f7f3'
          : theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.1)' : '#ffebee',
        border: '1px solid',
        borderColor: isShopOpen
          ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.5)' : '#00b388'
          : theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.5)' : '#ff5252'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>Shop Status</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isShopOpen}
                onChange={toggleShopStatus}
                color="primary"
              />
            }
            label={isShopOpen ? 'Open' : 'Closed'}
          />
        </Stack>
      </Card>

      <Stack spacing={2}>
        {orders.length === 0 && <Alert severity="info">No orders in queue.</Alert>}
        {orders.map(order => {
          const orderTime = order.createdAt.seconds * 1000;
          const duration = Math.floor((currentTime - orderTime) / 1000);
          
          return (
            <Card key={order.id} elevation={3} sx={{ 
              borderRadius: 3, 
              boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 2,
              background: theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#fff',
              border: '1.5px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.5)' : '#00b388'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" fontWeight={600}>{pizzas[order.pizzaId]?.name || 'Pizza'}</Typography>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={formatDuration(duration)}
                    color={duration > 900 ? 'error' : duration > 600 ? 'warning' : 'default'}
                    sx={{ 
                      fontWeight: 600,
                      background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
                    }}
                  />
                </Box>
                <Stack spacing={1}>
                  <Typography variant="body1" fontWeight={800} sx={{ color: theme.palette.mode === 'dark' ? '#33c3a0' : '#00b388' }}>
                    {order.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order ID: {order.orderIdentifier}
                  </Typography>
                </Stack>
                <Chip 
                  label={statusColors[order.status]?.label || order.status} 
                  color={statusColors[order.status]?.color || 'default'} 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    mt: 1,
                    mb: 1,
                    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
                  }} 
                />
                <Stack direction="row" spacing={1} mt={2}>
                  {order.status === 'in_progress' && (
                    <Button 
                      variant="contained" 
                      sx={{ 
                        borderRadius: 3, 
                        fontWeight: 600, 
                        background: '#00b388', 
                        '&:hover': { 
                          background: '#009e76' 
                        } 
                      }} 
                      onClick={() => handleStatusChange(order, 'completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      sx={{ 
                        borderRadius: 3, 
                        fontWeight: 600, 
                        background: '#00b388', 
                        '&:hover': { 
                          background: '#009e76' 
                        } 
                      }} 
                      onClick={() => handleStatusChange(order, 'picked_up')}
                    >
                      Picked Up
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default AdminDashboard; 