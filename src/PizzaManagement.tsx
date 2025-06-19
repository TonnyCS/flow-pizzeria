import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Box, Typography, Card, CardContent, Switch, CircularProgress, Alert, Stack, useTheme, IconButton } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Pizza {
  id: string;
  name: string;
  ingredients: string[];
  isAvailable?: boolean;
}

const PizzaManagement: React.FC = () => {
  const [pizzas, setPizzas] = useState<Record<string, Pizza>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    const unsubPizzas = onSnapshot(collection(db, 'pizzas'), (pizzaSnapshot) => {
      const pizzaMap: Record<string, Pizza> = {};
      pizzaSnapshot.docs.forEach(docSnap => {
        pizzaMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as Pizza;
      });
      setPizzas(pizzaMap);
      setLoading(false);
    }, () => {
      setError('Failed to load pizzas.');
      setLoading(false);
    });

    return () => {
      unsubPizzas();
    };
  }, []);

  const togglePizzaAvailability = async (pizzaId: string) => {
    try {
      const pizza = pizzas[pizzaId];
      await updateDoc(doc(db, 'pizzas', pizzaId), {
        isAvailable: !pizza.isAvailable
      });
    } catch (err) {
      setError('Failed to update pizza availability.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 2, maxWidth: 'md', mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <IconButton 
          onClick={() => navigate('/admin')}
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            '&:hover': {
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Pizza Management
        </Typography>
      </Box>
      
      <Box display="flex" flexDirection="column" gap={2}>
        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Pizza Availability</Typography>
          <Stack spacing={2}>
            {Object.values(pizzas).map((pizza) => (
              <Card 
                key={pizza.id} 
                onClick={() => togglePizzaAvailability(pizza.id)}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: pizza.isAvailable 
                    ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.5)' : '#e6f7f3'
                    : theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.5)' : '#ffebee',
                  background: pizza.isAvailable
                    ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#fff'
                    : theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.1)' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 3,
                    background: pizza.isAvailable
                      ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.2)' : '#f7fcfa'
                      : theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.2)' : '#fff5f5'
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{pizza.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pizza.ingredients.join(', ')}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: pizza.isAvailable 
                      ? theme.palette.mode === 'dark' ? '#33c3a0' : '#00b388'
                      : theme.palette.mode === 'dark' ? '#ff7575' : '#ff5252',
                    gap: 1
                  }}>
                    <Typography variant="body2" fontWeight={600}>
                      {pizza.isAvailable ? 'Available' : 'Unavailable'}
                    </Typography>
                    {pizza.isAvailable ? <CheckCircleIcon /> : <BlockIcon />}
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default PizzaManagement; 