const API_BASE_URL = 'http://localhost:5000/api';

export const savePrediction = async (predictionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(predictionData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save prediction');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Save prediction error:', error);
    throw error;
  }
};

export const getPredictions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/predictions`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch predictions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get predictions error:', error);
    throw error;
  }
};

export const createConsultation = async (consultationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(consultationData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create consultation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create consultation error:', error);
    throw error;
  }
};

export const getConsultations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/consultations`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch consultations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get consultations error:', error);
    throw error;
  }
};

export const updateDoctorAvailability = async (availabilityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/doctor/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(availabilityData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update availability');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update availability error:', error);
    throw error;
  }
};
