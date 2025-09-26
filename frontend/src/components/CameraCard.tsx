import React, { useEffect, useState } from 'react';

interface Alert {
  id: number;
  cameraId: number;
  timestamp: string;
  snapshotUrl: string | null;
  bbox: { x: number; y: number; w: number; h: number }[];
  meta: any | null;
  Camera?: { id: number; name?: string; rtspUrl: string };
}

const Alerts: React.FC = () => {
  
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
          const token = localStorage.getItem('token'); 


  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/cameras',{
          headers: {
            Authorization: token ? `Bearer ${token}` : '', 
          },}
        );
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


  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        <h1>RTSP Video Streams</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {cameras.map((camera) => (
            <div
              key={camera.id}
              style={{ flex: '1 1 300px', maxWidth: '500px' }}
            >
              <h3>{camera.name || `Camera ${camera.id}`}</h3>
              <img
                // src={camera.streamUrl}
                  src={`${camera.streamUrl}?token=${token}`}

                alt={`Stream for ${camera.name || `Camera ${camera.id}`}`}
                style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
              />
                
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Alerts;