import axios from 'axios';
import { ORIGIN_QUERY_MAX_LENGTH } from 'src/constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.postStart = async ({
  userId,
  conversationId,
  language,
  allConversations,
  origin,
}, cancelToken = undefined) => api.post('/api/start', {
  userId,
  conversationId,
  origin: (typeof origin === 'string' ? origin : '').trim().slice(0, ORIGIN_QUERY_MAX_LENGTH),
  language,
  allConversations,
}, { cancelToken });

export default api;
