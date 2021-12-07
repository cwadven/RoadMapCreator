import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL + "/api",
    // params: {
    //     api_key: 'a4a599b5b19fb6fca6b94df7abe615d0',
    //     language: 'en-US',
    // },
});

export const roadMap = {
    roadMapList: () => api.get('/roadmap'),
    roadMapDetail: (roadMapId) => api.get(`/roadmap/${roadMapId}`),
    findShortestPath: (roadMapId) => api.get(`/roadmap/${roadMapId}/shortest-direction`, {}),
};

export const baseNode = {
    createBaseNode: (roadMapId) => api.post(`/roadmap/${roadMapId}/basenode`, {}),
    updateBaseNode: (baseNodeId) => api.put(`/roadmap/basenode/${baseNodeId}`, {}),
};

export const degree = {
    createOrUpdateDegree: () => api.post('/roadmap/basenode/degree', {}),
    deleteDegree: () => api.put('/roadmap/basenode/degree', {}),
};