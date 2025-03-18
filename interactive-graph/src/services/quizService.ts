import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface QuizResponse {
  userName: string;
  groupCode: string;
  responses: Array<{
    quadrantNumber: number;
    percentages: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  }>;
  timestamp: string;
}

export const saveQuizResponse = async (response: QuizResponse) => {
  try {
    const docRef = await addDoc(collection(db, 'quizResponses'), response);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz response:', error);
    throw error;
  }
};

export const getGroupResponses = async (groupCode: string): Promise<QuizResponse[]> => {
  try {
    const q = query(
      collection(db, 'quizResponses'), 
      where('groupCode', '==', groupCode)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as QuizResponse);
  } catch (error) {
    console.error('Error getting group responses:', error);
    throw error;
  }
};

export const calculateCompatibility = (
  responses1: QuizResponse['responses'],
  responses2: QuizResponse['responses']
): number => {
  let totalDifference = 0;
  const numQuestions = responses1.length;

  for (let i = 0; i < numQuestions; i++) {
    const response1 = responses1[i];
    const response2 = responses2[i];
    
    // Calculate difference in percentages
    const differences = [
      Math.abs(response1.percentages.top - response2.percentages.top),
      Math.abs(response1.percentages.bottom - response2.percentages.bottom),
      Math.abs(response1.percentages.left - response2.percentages.left),
      Math.abs(response1.percentages.right - response2.percentages.right)
    ];

    // Average difference for this question
    totalDifference += differences.reduce((a, b) => a + b, 0) / 4;
  }

  // Convert average difference to compatibility percentage
  const averageDifference = totalDifference / numQuestions;
  const compatibility = 100 - averageDifference;
  
  return Math.max(0, Math.min(100, Math.round(compatibility)));
}; 