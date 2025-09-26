import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
// import { getCameras } from '../services/cameras';

interface CameraCardProps {
  camera: any;
  onDelete: (id: number) => void;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera, onDelete }) => {
  const token = localStorage.getItem('token');
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{camera.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {camera.rtspUrl}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {camera?.location}
        </Typography>

        {camera.streamUrl && (
          <Box sx={{ my: 2 }}>
            <img src={`${camera.streamUrl}?token=${token}`} alt={`Stream for ${camera.name}`} style={{ width: '100%' }} />
          </Box>
        )}
        <Button variant="contained" color="error" onClick={() => onDelete(camera.id)}>
          Delete
        </Button>
      </CardContent>
    </Card>
  );
};

export default CameraCard;
