import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// APIs
export const predictDisease = (formData) => API.post('/predict-disease', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const fetchSymptomOptions = () => API.get('/symptom-options');
export const diagnoseSymptoms = (data) => API.post('/diagnose-symptoms', data);

export const recommendCrop = (data) => API.post('/recommend-crop', data);

export const recommendFertilizer = (data) => API.post('/recommend-fertilizer', data);

// Community
export const fetchPosts = (params = {}) => API.get('/community/posts', { params });
export const createPost = (formData) => API.post('/community/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const votePost = (id, type) => API.post(`/community/posts/${id}/vote`, { type });
export const addAnswer = (id, data) => API.post(`/community/posts/${id}/answers`, data);

export const API_BASE = API.defaults.baseURL;

export default API;
