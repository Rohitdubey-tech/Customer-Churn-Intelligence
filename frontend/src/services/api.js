import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

export const getExecutiveAnalytics = async () => {
  const response = await API.get('/analytics/executive');
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await API.get('/model/metrics');
  return response.data;
};

export const getModelFeatures = async () => {
  const response = await API.get('/model/features');
  return response.data;
};

export const getCustomers = async (params = {}) => {
  const response = await API.get('/customers', { params });
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await API.get(`/customers/${id}`);
  return response.data;
};

export const getCustomerExplanation = async (id, topN = 10) => {
  const response = await API.get(`/customers/${id}/explanation`, {
    params: { top_n: topN },
  });
  return response.data;
};

export const getGlobalExplainability = async () => {
  const response = await API.get('/explainability/global');
  return response.data;
};

export const getFeatureDependence = async (featureName) => {
  const response = await API.get(`/explainability/dependence/${featureName}`);
  return response.data;
};

export const predictSingle = async (payload) => {
  const response = await API.post('/predict', payload);
  return response.data;
};

export const predictBatch = async (payload) => {
  const response = await API.post('/predict/batch', payload);
  return response.data;
};

export const uploadCSV = async (formData) => {
  const response = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default API;
