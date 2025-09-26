import  { useEffect, useState } from 'react';

const App = () => {
  const [cameras, setCameras] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/cameras');
        if (!response.ok) throw new Error('Failed to fetch cameras');
        const data = await response.json();
        setCameras(data);
      } catch (err) {
        setError('Failed to connect to the backend server');
        console.error(err);
      }
    };
    fetchCameras();
  }, []);

  return (
    <div>
      <h1>RTSP Video Streams</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {cameras.map((camera) => (
          <div key={camera.id} style={{ flex: '1 1 300px', maxWidth: '500px' }}>
            <h3>{camera.name || `Camera ${camera.id}`}</h3>
            <img
              src={camera.streamUrl}
              alt={`RTSP Video Feed ${camera.id}`}
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                setError(`Failed to load video stream for camera ${camera.id}`);
                console.error(`Image load error for camera ${camera.id}:`, e);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;