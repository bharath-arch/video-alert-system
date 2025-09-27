import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  TextField,
  Pagination,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getAlerts } from '../services/cameras';

interface BBox {
  h: number;
  w: number;
  x: number;
  y: number;
}

interface Alert {
  id: number;
  cameraId: number;
  timestamp: string;
  snapshotUrl: string;
  bbox: BBox[];
  meta: Record<string, unknown>;
  Camera: Camera;
}

interface Camera {
  id: number;
  name: string;
  rtspUrl: string;
  streamUrl?: string;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const alertsPerPage = 6;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchAlerts = async () => {
      try {
        const fetchedAlerts = await getAlerts();
        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts(); // initial fetch

    // ⏳ Poll every 10 seconds
    intervalId = setInterval(fetchAlerts, 10000);

    // 🧹 Cleanup when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // 🔍 Search filter
  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.Camera?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(alert.timestamp)
        .toLocaleString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // 📄 Pagination
  const indexOfLastAlert = page * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '90dvh' }}>
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
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="inherit"
                fullWidth
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Home
              </Button>
            </Link>
          </Stack>
        </Paper>

        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search alerts by camera name or timestamp..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          sx={{ mb: 3, borderRadius: 2, background: 'white' }}
        />

        <Typography component="h1" variant="h4" fontWeight="bold" color="white" gutterBottom>
          Recent Alerts
        </Typography>

        {currentAlerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No alerts available.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3} justifyContent="center">
              {currentAlerts.map((alert) => (
                <Grid item xs={12} sm={6} key={alert.id}>
                  <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
                      {alert.bbox.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Bounding Box: {JSON.stringify(alert.bbox[0])}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default AlertsPage;
