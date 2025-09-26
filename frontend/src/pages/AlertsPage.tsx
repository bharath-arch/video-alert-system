import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Grid,
 
  Button,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getAlerts } from '../services/cameras';

interface Alert {
  id: string;
  cameraId: string;
  timestamp: string;
  type: string;
  details: string;
  Camera: Camera;
  snapshotUrl: string;
}

interface Camera {
  id: number;
  name: string;
  rtspUrl: string;
  streamUrl?: string;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const fetchedAlerts = await getAlerts();
        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, minHeight: '90dvh', }}>
            <Container maxWidth="lg">
      
      {/* Header */}
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
            Alerts Dashboard
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
            <Link to="/alerts" style={{ width: '100%', textDecoration: 'none' }}>
             <Link to="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="inherit"
                fullWidth={true}
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Home
              </Button>
              </Link>
            </Link>
            
          </Stack>
        </Paper>
      

      {/* <Container maxWidth="md" sx={{ py: 4 }}> */}
        <Typography component="h1" variant="h4" fontWeight="bold" color="white" gutterBottom>
          Recent Alerts
        </Typography>

        {alerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No alerts available.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ display: 'flex', flexWrap: 'wrap' , justifyContent: 'center', alignItems: 'center'}}>
            {alerts.map((alert) => (
              <Grid item xs={12} sm={6} key={alert.id}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={alert.snapshotUrl}
                    alt={`Snapshot from camera ${alert.cameraId}`}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {alert.Camera?.name || `Camera ${alert.cameraId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      RTSP: {alert.Camera?.rtspUrl}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {alert.type}
                    </Typography>
                    {alert.details && (
                      <Typography variant="body2" color="text.secondary">
                        Details: {alert.details}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      {/* </Container> */}
            </Container >
        
    </Box>
  );
};

export default AlertsPage;
