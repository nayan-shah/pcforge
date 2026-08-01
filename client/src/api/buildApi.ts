import apiClient from './axios';

export interface BuildComponentSnapshot {
  componentId: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  powerWatts: number;
  image: string;
}

export interface CreateBuildPayload {
  name: string;
  components: BuildComponentSnapshot[];
  totalPrice: number;
  totalPower: number;
}

export async function createBuild(payload: CreateBuildPayload) {
  const response = await apiClient.post('/builds', payload);
  return response.data.data;
}

export async function getBuilds() {
  const response = await apiClient.get('/builds');
  return response.data.data;
}
