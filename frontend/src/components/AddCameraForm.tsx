import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

interface AddCameraFormProps {
  onAdd: (name: string, rtspUrl: string , location: string) => void;
}

const AddCameraForm: React.FC<AddCameraFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && rtspUrl) {
      onAdd(name, rtspUrl , location);
      setName('');
      setRtspUrl('');
      setLocation('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      {/* <Typography variant="h6">Add a new camera</Typography> */}
      <TextField
        margin="normal"
        required
        fullWidth
        label="Camera Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="RTSP URL"
        value={rtspUrl}
        onChange={(e) => setRtspUrl(e.target.value)}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
        Add Camera
      </Button>
    </Box>
  );
};

export default AddCameraForm;
