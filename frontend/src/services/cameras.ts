import api from './api';

export interface Camera {
  id: number;
  name: string;
  rtspUrl: string;
  streamUrl?: string;
}

export const getCameras = async (): Promise<Camera[]> => {
  const response = await api.get('/cameras');
  return response.data;
};

export const addCamera = async (name: string, rtspUrl: string): Promise<Camera> => {
  const response = await api.post('/cameras', { name, rtspUrl });
  return response.data;
};

export const deleteCamera = async (id: number): Promise<void> => {
  await api.delete(`/cameras/${id}`);
};

export const updateCamera = async (id: number, name: string, rtspUrl: string): Promise<Camera> => {
  const response = await api.put(`/cameras/${id}`, { name, rtspUrl });
  return response.data;
};

export const getAlerts = async (): Promise<any[]> => {
    const response = await api.get('/cameras/alerts');
    return response.data;
};