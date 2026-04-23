import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Clock } from 'lucide-react';
import {
  initQuiz,
  selectAnswer,
  nextQuestion,
  prevQuestion,
  goToQuestion,
  tick,
  endQuiz,
  resetQuiz
} from '../store/slices/quizSlice';
import { fetchNoteById } from '../store/slices/notesSlice';
import Navbar from '../components/Navbar';
import { QuestionCard } from '../components/QuestionCard';
import { QuizTimer, QuizProgress, QuizStatus } from '../components/QuizComponents';

export default function QuizPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { currentNote, loading } = useSelector(state => state.notes);
  const {
    quizQuestions,
    answers,
    currentIndex,
    status,
    timeRemaining,
    score
  } = useSelector(state => state.quiz);
  
  const [showResults, setShowResults] = useState(false);
  const [timeLimit] = useState(300);

  useEffect(() => {
    if (currentNote?._id !== id && id) {
      dispatch(fetchNoteById(id));
    }
  }, [dispatch, id, currentNote]);

  useEffect(() => {
    if (currentNote?.analysis?.questions && currentNote.analysis.questions.length > 0) {
      dispatch(initQuiz({
        questions: currentNote.analysis.questions,
        timeLimit: timeLimit
      }));
    }
  }, [currentNote, dispatch]);

  useEffect(() => {
    if (timeRemaining > 0 && status === 'active') {
      const timer = setInterval(() => dispatch(tick()), 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && status === 'active') {
      handleEndQuiz();
    }
  }, [timeRemaining, status, dispatch]);

  const handleAnswer = (answer) => {
    const question = quizQuestions[currentIndex];
    const correctAnswer = question.answer;
    const isCorrect = answer === correctAnswer;
    dispatch(selectAnswer({ questionIndex: currentIndex, answer, isCorrect }));
  };

  const handleEndQuiz = () => {
    dispatch(endQuiz());
    setShowResults(true);
  };

  const handleRestart = () => {
    dispatch(resetQuiz());
    if (currentNote?.analysis?.questions) {
      dispatch(initQuiz({
        questions: currentNote.analysis.questions,
        timeLimit: timeLimit
      }));
    }
    setShowResults(false);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizQuestions.length;
  const currentScore = quizQuestions.reduce((acc, q, i) => {
    return acc + (answers[i]?.isCorrect ? 1 : 0);
  }, 0);

  if (!currentNote?.analysis?.questions || currentNote.analysis.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No questions available for this note</p>
            <button
              onClick={() => navigate(`/dashboard/notes/${id}`)}
              className="btn-primary"
            >
              Back to Note
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (showResults || status === 'completed' || status === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(`/dashboard/notes/${id}`)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 btn-secondary"
              >
                <RotateCcw size={18} />
                Restart
              </button>
            </div>

            <QuizStatus
              score={currentScore}
              total={totalQuestions}
              status={status}
            />

            <div className="card space-y-4">
              <h3 className="font-semibold text-lg">Review Answers</h3>
              {quizQuestions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer?.isCorrect;
                return (
                  <div
                    key={i}
                    className={`p-5 rounded-[20px] bg-[#e0e5ec] dark:bg-[#2d3748] ${
                      isCorrect
                        ? 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] border border-green-400/30'
                        : 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] border border-red-400/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          {q.question}
                        </p>
                        {userAnswer && (
                          <p className={`text-sm ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Your answer: {userAnswer.answer}
                          </p>
                        )}
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {q.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/dashboard/notes/${id}`)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600"
            >
              <ArrowLeft size={20} />
              Exit Quiz
            </button>
            
            <QuizTimer timeRemaining={timeRemaining} totalTime={timeLimit} />
            
            <button
              onClick={handleEndQuiz}
              className="btn-primary"
            >
              Submit
            </button>
          </div>

          <QuizProgress
            current={currentIndex}
            total={totalQuestions}
            answered={Object.keys(answers)}
          />

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <QuestionCard
              question={quizQuestions[currentIndex]}
              index={currentIndex}
              total={totalQuestions}
              onAnswer={handleAnswer}
              selectedAnswer={answers[currentIndex]?.answer}
              showResult={false}
            />
          </motion.div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch(prevQuestion())}
              disabled={currentIndex === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {quizQuestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => dispatch(goToQuestion(i))}
                  className={`w-10 h-10 rounded-[15px] text-sm font-medium transition-all ${
                    i === currentIndex
                      ? 'bg-[#6c9cff] text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.3)]'
                      : answers[i]
                      ? 'bg-green-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)]'
                      : 'clay-btn-secondary !px-0 !py-0'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => dispatch(nextQuestion())}
                className="btn-secondary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleEndQuiz}
                className="btn-primary"
              >
                Finish
              </button>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            {answeredCount} of {totalQuestions} answered •{' '}
            {currentScore} correct so far
          </div>
        </div>
      </main>
    </div>
  );
}