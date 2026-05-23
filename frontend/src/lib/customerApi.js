import axios from 'axios';
import { API_BASE } from './cartApi';

const authApi = axios.create({
  baseURL: `${API_BASE}/auth_api.php`,
  withCredentials: true,
});

export async function checkAuth() {
  const { data } = await authApi.get('', { params: { action: 'check_auth' } });
  return data;
}
