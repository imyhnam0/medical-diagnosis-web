import axios from 'axios';

const API_BASE_URL = 'https://snumedai.store/api/analyze';
const STORAGE_KEY = 'medical_session_id';

// 세션 ID 가져오기 (저장된 것이 있으면 사용, 없으면 null)
const getSessionId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// 세션 ID 저장하기 (이미 있으면 저장하지 않음)
const saveSessionId = (sessionId) => {
  if (!sessionId) return;
  try {
    const existingId = localStorage.getItem(STORAGE_KEY);
    if (existingId === sessionId) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, sessionId);
    console.log('✅ 세션 ID 저장:', sessionId);
  } catch {
    // localStorage 사용 불가한 환경에서는 그냥 무시
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 저장된 세션 ID가 있으면 헤더에 추가
api.interceptors.request.use((config) => {
  const sessionId = getSessionId();
  if (sessionId) {
    config.headers = config.headers || {};
    config.headers['X-Session-Id'] = sessionId;
    console.log('📤 요청에 세션 ID 포함:', sessionId);
  } else {
    console.log('📤 세션 ID 없음 - 서버에서 새로 생성될 예정');
  }
  return config;
});

// 응답 인터셉터: 서버에서 보낸 세션 ID를 저장
api.interceptors.response.use((response) => {
  const headers = response.headers || {};
  const sessionId =
    headers['x-session-id'] ||
    headers['X-Session-Id'] ||
    headers['X-SESSION-ID'];

  if (sessionId) {
    saveSessionId(sessionId);
  }
  return response;
}, (error) => {
  const headers = error?.response?.headers || {};
  const sessionId =
    headers['x-session-id'] ||
    headers['X-Session-Id'] ||
    headers['X-SESSION-ID'];

  if (sessionId) {
    saveSessionId(sessionId);
  }
  return Promise.reject(error);
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

// 데모 요청 이메일 저장
export const saveDemoRequest = async (email) => {
  const response = await axios.post('https://snumedai.store/api/demo-request', { email });
  return response.data;
};

