import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import QuestionPage from './pages/QuestionPage'
import WaitingPage from './pages/WaitingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<QuestionPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
      </Routes>
    </Router>
  )
}

export default App
