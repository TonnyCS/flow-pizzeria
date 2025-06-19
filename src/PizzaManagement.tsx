import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Switch, 
  CircularProgress, 
  Alert, 
  Stack, 
  useTheme, 
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Chip,
  Divider
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
  const [editMode, setEditMode] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPizza, setNewPizza] = useState({ name: '', ingredients: '' });
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

  const addPizza = async () => {
    if (!newPizza.name.trim() || !newPizza.ingredients.trim()) {
      setError('Please fill in both name and ingredients.');
      return;
    }

    try {
      const ingredients = newPizza.ingredients.split(',').map(ingredient => ingredient.trim());
      await addDoc(collection(db, 'pizzas'), {
        name: newPizza.name.trim(),
        ingredients,
        isAvailable: true
      });
      setNewPizza({ name: '', ingredients: '' });
      setAddDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to add pizza.');
    }
  };

  const removePizza = async (pizzaId: string) => {
    try {
      await deleteDoc(doc(db, 'pizzas', pizzaId));
    } catch (err) {
      setError('Failed to remove pizza.');
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

      {/* Edit Mode Toggle */}
      <Card sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon color={editMode ? "primary" : "action"} />
            <Typography variant="h6" fontWeight={600}>
              Edit Mode
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                color="primary"
              />
            }
            label={editMode ? "On" : "Off"}
          />
        </Box>
        
        {editMode && (
          <Box mt={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Add New Pizza
            </Button>
          </Box>
        )}
      </Card>
      
      <Box display="flex" flexDirection="column" gap={2}>
        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Pizza Availability</Typography>
          <Stack spacing={2}>
            {Object.values(pizzas).map((pizza) => (
              <Card 
                key={pizza.id} 
                onClick={editMode ? undefined : () => togglePizzaAvailability(pizza.id)}
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
                  cursor: editMode ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: editMode ? 'none' : 'translateY(-2px)',
                    boxShadow: editMode ? 'none' : (theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 3),
                    background: editMode ? 'inherit' : (pizza.isAvailable
                      ? theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.2)' : '#f7fcfa'
                      : theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.2)' : '#fff5f5')
                  },
                  '&:active': {
                    transform: editMode ? 'none' : 'translateY(0)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{pizza.name}</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {pizza.ingredients.map((ingredient, index) => (
                        <Chip
                          key={index}
                          label={ingredient}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.75rem',
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {editMode ? (
                      <IconButton
                        onClick={() => removePizza(pizza.id)}
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.1)' : 'rgba(255, 82, 82, 0.05)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : (
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
                    )}
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Card>
      </Box>

      {/* Add Pizza Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Pizza</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Pizza Name"
              value={newPizza.name}
              onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Ingredients (comma-separated)"
              value={newPizza.ingredients}
              onChange={(e) => setNewPizza({ ...newPizza, ingredients: e.target.value })}
              fullWidth
              variant="outlined"
              placeholder="e.g., tomato sauce, mozzarella, basil"
              helperText="Separate ingredients with commas"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={addPizza} variant="contained">Add Pizza</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PizzaManagement; 