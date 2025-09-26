import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getCameras, addCamera, deleteCamera } from '../services/cameras';
import CameraCard from '../components/CameraCard';
import AddCameraForm from '../components/AddCameraForm';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const [cameras, setCameras] = useState<any>([]);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    const fetchedCameras = await getCameras();
    setCameras(fetchedCameras);
  };

  const handleAddCamera = async (name: string, rtspUrl: string) => {
    await addCamera(name, rtspUrl);
    fetchCameras();
  };

  const handleDeleteCamera = async (id: number) => {
    await deleteCamera(id);
    fetchCameras();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box
      sx={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold">
            Dashboard
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
            <Link to="/alerts" style={{ width: '100%', textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="inherit"
                fullWidth={true}
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Alerts
              </Button>
            </Link>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              fullWidth={true}
              sx={{ borderRadius: 2, px: 3, py: 1 }}
            >
              Logout
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={4}
          sx={{ p: 3, mb: 4, borderRadius: 3, backdropFilter: 'blur(6px)' }}
        >
          <Typography variant="h6" fontWeight="500" gutterBottom>
            Add a New Camera
          </Typography>
          <AddCameraForm onAdd={handleAddCamera} />
        </Paper>

        <Grid container spacing={3}>
          {cameras.map((camera: any) => (
            //@ts-ignore
            <Grid item xs={12} sm={6} md={4} lg={3} key={camera.id}>
              <CameraCard camera={camera} onDelete={handleDeleteCamera} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;