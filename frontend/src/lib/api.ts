import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadResume = async (formData: FormData) => {
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const startAssessment = async (sessionId: string, skill: string) => {
  const response = await api.get(`/start-assessment/${sessionId}/${skill}`);
  return response.data;
};

export const submitAnswer = async (answerData: any) => {
  const response = await api.post('/submit-answer', answerData);
  return response.data;
};

export const generateRoadmap = async (sessionId: string, targetRole: string) => {
  const response = await api.get(`/generate-roadmap/${sessionId}?target_role=${targetRole}`);
  return response.data;
};

export const getFinalReport = async (sessionId: string) => {
  const response = await api.get(`/final-report/${sessionId}`);
  return response.data;
};

export default api;
