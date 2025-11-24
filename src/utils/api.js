import axios from 'axios';

const API_BASE_URL = 'http://98.91.66.27:8080/api/analyze';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeAgeBmiGender = async (data) => {
  const response = await api.post('/age-bmi-gender', data);
  return response.data;
};

export const analyzeDrinkingSmoking = async (data) => {
  const response = await api.post('/drinking-smoking', data);
  return response.data;
};

export const analyzeJob = async (data) => {
  const response = await api.post('/job', data);
  return response.data;
};

export const analyzeExerciseStress = async (data) => {
  const response = await api.post('/exercise-stress', data);
  return response.data;
};

export const analyzePastDisease = async (data) => {
  const response = await api.post('/past-disease', data);
  return response.data;
};

export const analyzeChestPain = async (data) => {
  const response = await api.post('/chestpain', data);
  return response.data;
};

export const analyzeSymptoms = async (data) => {
  const response = await api.post('/symptoms', data);
  return response.data;
};

export const analyzeAggravation = async (data) => {
  const response = await api.post('/aggravation', data);
  return response.data;
};

export const analyzeRiskFactor = async (data) => {
  const response = await api.post('/riskfactor', data);
  return response.data;
};

export const getTopDiseases = async () => {
  const response = await api.get('/top-diseases');
  return response.data;
};

export const getAllDiseases = async () => {
  const response = await api.get('/all-diseases');
  return response.data;
};

export const getDiseaseInfo = async (data) => {
  const response = await api.post('/disease-info', data);
  return response.data;
};

export const resetDiagnosis = async () => {
  const response = await api.post('/reset-diagnosis');
  return response.data;
};

