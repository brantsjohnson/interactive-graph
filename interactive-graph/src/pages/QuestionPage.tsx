import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '../components/Grid';
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

interface Question {
  title: string;
  topText: string;
  leftText: string;
  rightText: string;
  bottomText: string;
}

const questions: Question[] = [
  {
    title: "Put a dot on the graph where you feel like your core self",
    topText: "I am most energized when I'm around people",
    leftText: "I am most comfortable observing and listening",
    rightText: "I am most comfortable expressing my thoughts",
    bottomText: "I am most refreshed when I have time alone"
  },
  {
    title: "How do you work best?",
    topText: "Do you prefer structured environments?",
    leftText: "Do you focus on details?",
    rightText: "Do you see the big picture?",
    bottomText: "Do you like flexible schedules?"
  }
  // Add more questions as needed
];

const QuestionPage = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [shouldResetGrid, setShouldResetGrid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user came from home page
    const userName = sessionStorage.getItem('userName');
    const groupCode = sessionStorage.getItem('groupCode');
    if (!userName || !groupCode) {
      navigate('/');
    }
  }, [navigate]);

  const handleGridClick = (data: Answer) => {
    setCurrentAnswer(data);
    setShouldResetGrid(false);
  };

  const saveToFirebase = async (data: any) => {
    const { userName, groupCode } = data;
    const sanitizedUserName = userName.replace(/[.#$\[\]]/g, '_');
    const sanitizedGroupCode = groupCode.replace(/[.#$\[\]]/g, '_');
    
    const url = `${FIREBASE_DB_URL}/quizResponses/${sanitizedGroupCode}/${sanitizedUserName}.json`;
    
    console.log('Attempting to save to URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }

      console.log('Successfully saved to Firebase:', result);
      return result;
    } catch (error) {
      console.error('Error saving to Firebase:', {
        error,
        url,
        data: JSON.stringify(data)
      });
      throw error;
    }
  };

  const handleNextQuestion = async () => {
    if (!currentAnswer) {
      console.error('No current answer available');
      return;
    }

    try {
      setIsSubmitting(true);

      // Store the current answer
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(newAnswers);

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer(null);
        setShouldResetGrid(true);
      } else {
        const userName = sessionStorage.getItem('userName');
        const groupCode = sessionStorage.getItem('groupCode');
        
        if (!userName || !groupCode) {
          throw new Error('Missing user information');
        }

        const finalAnswers = [...newAnswers];
        finalAnswers[currentQuestionIndex] = currentAnswer;
        
        const quizData = {
          userName,
          groupCode,
          responses: finalAnswers,
          timestamp: new Date().toISOString()
        };

        console.log('Saving quiz data:', quizData);
        try {
          await saveToFirebase(quizData);
          console.log('Successfully saved responses');
          navigate('/waiting');
        } catch (error: any) {
          console.error('Failed to save responses:', error);
          if (error.message.includes('401') || error.message.includes('403')) {
            alert('Permission denied. Please check your Firebase database rules.');
          } else if (error.message.includes('404')) {
            alert('Database path not found. Please check your Firebase configuration.');
          } else {
            alert(`Error saving responses: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleNextQuestion:', error);
      alert('There was an error saving your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) {
      return;
    }

    if (!currentAnswer) {
      alert('Please select a point on the grid before continuing.');
      return;
    }

    try {
      await handleNextQuestion();
    } catch (error) {
      console.error('Error in button click handler:', error);
      alert('There was an error processing your answer. Please try again.');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  console.log('Render state:', {
    currentQuestionIndex,
    hasCurrentAnswer: !!currentAnswer,
    answersLength: answers.length,
    shouldResetGrid
  });

  return (
    <div className="container" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        textAlign: 'center',
        marginBottom: '1rem',
        lineHeight: '1.2',
        maxWidth: '800px',
        padding: '0 20px'
      }}>{currentQuestion.title}</h2>
      
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1,
        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
        maxWidth: '600px',
        padding: '0 20px'
      }}>
        <div>{currentQuestion.topText}</div>
        {currentAnswer && <div>Top: {currentAnswer.percentages.top}%</div>}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '20px',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '800px',
        padding: '0 20px'
      }}>
        <div style={{
          width: '150px',
          textAlign: 'right',
          fontSize: 'clamp(0.875rem, 2vw, 1rem)'
        }}>
          <div>{currentQuestion.leftText}</div>
          {currentAnswer && <div>Left: {currentAnswer.percentages.left}%</div>}
        </div>

        <Grid onGridClick={handleGridClick} shouldReset={shouldResetGrid} />

        <div style={{
          width: '150px',
          textAlign: 'left',
          fontSize: 'clamp(0.875rem, 2vw, 1rem)'
        }}>
          <div>{currentQuestion.rightText}</div>
          {currentAnswer && <div>Right: {currentAnswer.percentages.right}%</div>}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
        maxWidth: '600px',
        padding: '0 20px'
      }}>
        <div>{currentQuestion.bottomText}</div>
        {currentAnswer && <div>Bottom: {currentAnswer.percentages.bottom}%</div>}
      </div>

      {currentAnswer && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div>Selected quadrant: {currentAnswer.quadrantNumber}</div>
          <button 
            onClick={handleButtonClick}
            className="next-button"
            disabled={!currentAnswer || isSubmitting}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: currentAnswer && !isSubmitting ? '#4CAF50' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentAnswer && !isSubmitting ? 'pointer' : 'not-allowed',
              zIndex: 1000,
              position: 'relative'
            }}
          >
            {isSubmitting 
              ? 'Processing...' 
              : currentQuestionIndex === questions.length - 1 
                ? 'Finish Quiz' 
                : 'Next Question'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <style>
        {`
          .next-button:hover {
            background-color: #45a049 !important;
            transform: scale(1.05);
            transition: all 0.2s ease;
          }
        `}
      </style>
    </div>
  );
};

export default QuestionPage; 