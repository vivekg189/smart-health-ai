import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaAmbulance, FaPhone, FaMapMarkerAlt, FaDirections, FaExclamationTriangle } from 'react-icons/fa';
import { Phone } from 'lucide-react';

const EmergencyMode = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [error, setError] = useState(null);

  const EMERGENCY_CONTACTS = {
    ambulance: '108',
    police: '100',
    fire: '101'
  };

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        fetchEmergencyHospitals(latitude, longitude);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const fetchEmergencyHospitals = async (lat, lon) => {
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:10000,${lat},${lon});
        way["amenity"="hospital"](around:10000,${lat},${lon});
      );
      out center 20;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: { 'Content-Type': 'text/plain' }
      });

      if (!response.ok) {
        throw new Error('API unavailable');
      }

      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const hospitals = data.elements.map(element => {
          const tags = element.tags || {};
          const h_lat = element.type === 'node' ? element.lat : element.center?.lat;
          const h_lon = element.type === 'node' ? element.lon : element.center?.lon;
          
          if (!h_lat || !h_lon) return null;
          
          const distance = calculateDistance(lat, lon, h_lat, h_lon);

          return {
            name: tags.name || 'Unnamed Hospital',
            lat: h_lat,
            lon: h_lon,
            distance: distance,
            address: buildAddress(tags),
            phone: tags.phone || tags['contact:phone'] || null,
            emergency: tags.emergency === 'yes',
            type: tags['healthcare:speciality'] || 'General'
          };
        }).filter(h => h !== null);

        hospitals.sort((a, b) => a.distance - b.distance);
        
        if (hospitals.length > 0) {
          setNearestHospital(hospitals[0]);
        } else {
          setError('No hospitals found within 10km. Use Google Maps to search.');
        }
      } else {
        setError('No hospitals found within 10km. Use Google Maps to search.');
      }
    } catch (err) {
      setError('Hospital service unavailable. Use Google Maps or call 108.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const buildAddress = (tags) => {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  const getDirections = (lat, lon) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Container className="py-5" style={{ marginTop: '40px', minHeight: '100vh', maxWidth: '960px' }}>
      {/* Emergency Header */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            backgroundColor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaAmbulance style={{ fontSize: '1.4rem', color: 'white' }} />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#b91c1c'
            }}
          >
            EMERGENCY MODE
          </h1>
          <p
            style={{
              margin: 0,
              marginTop: '2px',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}
          >
            Quick access to critical contacts and your nearest emergency hospital.
          </p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="mb-4 shadow-lg" style={{ border: '2px solid #ff4444' }}>
        <Card.Header style={{ background: '#ff4444', color: 'white' }}>
          <h5 className="mb-0"><FaPhone className="me-2" />Emergency Contacts</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <a href={`tel:${EMERGENCY_CONTACTS.ambulance}`} style={{ textDecoration: 'none' }}>
              <Button 
                variant="danger" 
                size="lg"
                style={{
                  minWidth: '150px',
                  boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)'
                }}
              >
                <FaAmbulance className="me-2" />
                Ambulance {EMERGENCY_CONTACTS.ambulance}
              </Button>
            </a>
            <a href={`tel:${EMERGENCY_CONTACTS.police}`} style={{ textDecoration: 'none' }}>
              <Button 
                variant="primary" 
                size="lg"
                style={{ minWidth: '150px' }}
              >
                <FaPhone className="me-2" />
                Police {EMERGENCY_CONTACTS.police}
              </Button>
            </a>
            <a href={`tel:${EMERGENCY_CONTACTS.fire}`} style={{ textDecoration: 'none' }}>
              <Button 
                variant="warning" 
                size="lg"
                style={{ minWidth: '150px' }}
              >
                <FaPhone className="me-2" />
                Fire {EMERGENCY_CONTACTS.fire}
              </Button>
            </a>
          </div>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Locating nearest emergency hospital...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="warning" className="shadow">
          <FaExclamationTriangle className="me-2" />
          {error}
          <Button variant="warning" size="sm" className="ms-3" onClick={getLocation}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Nearest Hospital */}
      {nearestHospital && !loading && (
        <Card className="shadow-lg" style={{ border: '2px solid #28a745' }}>
          <Card.Header style={{ background: '#28a745', color: 'white' }}>
            <h5 className="mb-0"><FaMapMarkerAlt className="me-2" />Nearest Emergency Hospital</h5>
          </Card.Header>
          <Card.Body>
            <h4 className="text-primary">{nearestHospital.name}</h4>
            <p className="mb-2">
              <strong>Distance:</strong> {nearestHospital.distance.toFixed(2)} km away
            </p>
            <p className="mb-2">
              <strong>Address:</strong> {nearestHospital.address}
            </p>
            {nearestHospital.emergency && (
              <Alert variant="success" className="py-2">
                ✓ Emergency services available
              </Alert>
            )}
            
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Button 
                variant="primary" 
                onClick={() => getDirections(nearestHospital.lat, nearestHospital.lon)}
              >
                <FaDirections className="me-2" />
                Get Directions
              </Button>
              
              {nearestHospital.phone && (
                <a href={`tel:${nearestHospital.phone}`} style={{ textDecoration: 'none' }}>
                  <Button variant="success">
                    <FaPhone className="me-2" />
                    Call Hospital
                  </Button>
                </a>
              )}
              
              <a href={`tel:${EMERGENCY_CONTACTS.ambulance}`} style={{ textDecoration: 'none' }}>
                <Button variant="danger">
                  <FaAmbulance className="me-2" />
                  Call Ambulance
                </Button>
              </a>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert variant="info" className="mt-4 shadow">
        <strong>Disclaimer:</strong> This system assists in locating emergency services but does not directly dispatch ambulances. 
        In case of a life-threatening emergency, call {EMERGENCY_CONTACTS.ambulance} immediately.
      </Alert>
      </Container>
    </div>
  );
};

export default EmergencyMode;
