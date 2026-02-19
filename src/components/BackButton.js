import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to = '/patient-dashboard', label = 'Back to Dashboard' }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline-secondary"
      onClick={() => navigate(to)}
      className="mb-3"
      style={{
        borderRadius: '50px',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '2px solid #00695C',
        color: '#00695C',
        fontWeight: 600,
        transition: 'all 0.3s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#00695C';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#00695C';
      }}
    >
      <ArrowLeft size={18} />
      {label}
    </Button>
  );
};

export default BackButton;
