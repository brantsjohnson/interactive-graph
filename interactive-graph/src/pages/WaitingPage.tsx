import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIREBASE_DB_URL } from '../config/firebase';

interface Answer {
  quadrantNumber: number;
  percentages: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface QuizResponse {
  userName: string;
  groupCode: string;
  responses: Answer[];
  timestamp: string;
}

const WaitingPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userName = sessionStorage.getItem('userName');
    const groupCode = sessionStorage.getItem('groupCode');

    if (!userName || !groupCode) {
      navigate('/');
      return;
    }

    const sanitizedGroupCode = groupCode.replace(/[.#$\[\]]/g, '_');
    const pollInterval = setInterval(fetchMatches, 5000);

    // Initial fetch
    fetchMatches();

    return () => clearInterval(pollInterval);

    async function fetchMatches() {
      try {
        const url = `${FIREBASE_DB_URL}/quizResponses/${sanitizedGroupCode}.json`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data) {
          setMatches([]);
          return;
        }

        // Convert the object of responses to an array and filter out the current user
        const responses = Object.values(data) as QuizResponse[];
        const otherResponses = responses.filter(r => r.userName !== userName);
        
        console.log('Found matches:', otherResponses.length);
        setMatches(otherResponses);
        
        // Only set loading to false after initial delay
        setTimeout(() => {
          setLoading(false);
        }, 3000);
        
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Error fetching matches. Please try again.');
        setLoading(false);
      }
    }
  }, [navigate]);

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#333' }}>Error</h2>
        <p style={{ color: '#333' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        marginBottom: '2rem',
        color: '#333'
      }}>Finding Your Matches</h2>
      
      {loading ? (
        <div>
          <p style={{ fontSize: '1.2rem', color: '#333' }}>Please wait while we process your responses...</p>
          <div className="loading-spinner"></div>
        </div>
      ) : matches.length > 0 ? (
        <div>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '2rem',
            color: '#333'
          }}>Your Matches</h3>
          <div className="matches-container">
            {matches.map((match, index) => (
              <div 
                key={match.userName} 
                className="match-row"
              >
                <div className="match-name">{match.userName}</div>
                <div className="match-badge">Match!</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '1rem',
            color: '#333'
          }}>Waiting for others in your group to complete the quiz...</p>
          <p style={{ 
            fontSize: '1.1rem',
            color: '#666'
          }}>Share your group code with others to see matches!</p>
          <div className="loading-spinner"></div>
        </div>
      )}

      <style>{`
        .matches-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .match-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          margin: 8px 0;
          background-color: #f5f5f5;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .match-row:hover {
          transform: translateY(-1px);
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .match-name {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
        }

        .match-badge {
          padding: 6px 12px;
          background-color: #4CAF50;
          color: white;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f0f0f0;
          border-top: 5px solid #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @media (prefers-color-scheme: dark) {
          h2, h3, h4, p {
            color: #ffffff !important;
          }
          
          .match-row {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .match-row:hover {
            background-color: rgba(255, 255, 255, 0.15);
          }

          .match-name {
            color: #ffffff;
          }

          .loading-spinner {
            border-color: rgba(255, 255, 255, 0.2);
            border-top-color: #ffffff;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WaitingPage; 