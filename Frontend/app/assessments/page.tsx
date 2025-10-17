"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  ClipboardList, 
  CheckCircle, 
  Clock,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";

interface AssignedAssessment {
  assignment_id: number;
  assessment_id: number;
  assessment_name: string;
  assessment_type: string;
  guidance_text: string;
  assigned_by_therapist_id: number;
  therapist_name: string;
  assigned_at: string;
  due_date: string | null;
  status: 'pending' | 'completed';
  completed_at: string | null;
  score: number | null;
  total_questions: number;
  answered_questions: number;
}

interface AssessmentQuestion {
  question_id: number;
  question_text: string;
  response_type: 'scale' | 'multiple_choice' | 'free_text' | 'yes_no';
  scale_min: number | null;
  scale_max: number | null;
  options: string | null;
  position: number;
}

interface AssessmentResponse {
  question_id: number;
  answer_value: number | null;
  answer_text: string | null;
}

function AssessmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [assignments, setAssignments] = useState<AssignedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignedAssessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [submittedScore, setSubmittedScore] = useState(0);

  useEffect(() => {
    if (user?.user_id) {
      fetchAssignments();
    }
  }, [user?.user_id, activeTab]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${user?.user_id}/assigned-assessments?status=${activeTab}`);
      const data = await res.json();
      
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (assignment: AssignedAssessment) => {
    try {
      setSelectedAssignment(assignment);
      
      // Fetch questions
      const res = await fetch(`/api/assessment-types?assessment_id=${assignment.assessment_id}&include_questions=true`);
      const data = await res.json();
      
      if (data.success && data.assessments.length > 0) {
        const sortedQuestions = data.assessments[0].questions.sort((a: AssessmentQuestion, b: AssessmentQuestion) => 
          a.position - b.position
        );
        setQuestions(sortedQuestions);
        setResponses(sortedQuestions.map((q: AssessmentQuestion) => ({
          question_id: q.question_id,
          answer_value: null,
          answer_text: null
        })));
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
    }
  };

  const handleAnswer = (answer_value: number | null, answer_text: string | null) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = {
      ...newResponses[currentQuestionIndex],
      answer_value,
      answer_text
    };
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAssessment = async () => {
    if (!selectedAssignment) return;

    try {
      const res = await fetch(`/api/assessment-assignments/${selectedAssignment.assignment_id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });

      const data = await res.json();
      
      if (data.success) {
        setSubmittedScore(data.total_score);
        setShowResults(true);
        setTimeout(() => {
          setSelectedAssignment(null);
          setShowResults(false);
          setActiveTab('completed');
          fetchAssignments();
        }, 4000);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  const renderQuestion = () => {
    if (!questions[currentQuestionIndex]) return null;
    
    const question = questions[currentQuestionIndex];
    const currentResponse = responses[currentQuestionIndex];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800">
          {question.question_text}
        </h3>

        {question.response_type === 'scale' && (
          <div className="space-y-4">
            <input
              type="range"
              min={question.scale_min || 0}
              max={question.scale_max || 10}
              value={currentResponse.answer_value || question.scale_min || 0}
              onChange={(e) => handleAnswer(parseInt(e.target.value), null)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.scale_min || 0}</span>
              <span className="font-semibold text-lg text-blue-600">
                {currentResponse.answer_value !== null ? currentResponse.answer_value : (question.scale_min || 0)}
              </span>
              <span>{question.scale_max || 10}</span>
            </div>
          </div>
        )}

        {question.response_type === 'multiple_choice' && question.options && (
          <div className="space-y-3">
            {JSON.parse(question.options).map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  currentResponse.answer_value === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.response_type === 'free_text' && (
          <textarea
            value={currentResponse.answer_text || ''}
            onChange={(e) => handleAnswer(null, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
            rows={4}
            placeholder="Type your answer here..."
          />
        )}

        {question.response_type === 'yes_no' && (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(1, 'Yes')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                currentResponse.answer_value === 1
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(0, 'No')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                currentResponse.answer_value === 0
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              No
            </button>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  if (selectedAssignment && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back to Assessments
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedAssignment.assessment_name}
              </h2>
              <p className="text-gray-600 mt-2">
                {selectedAssignment.guidance_text}
              </p>
            </div>
            
            {renderQuestion()}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Assessment Complete!
          </h2>
          <p className="text-gray-600 mb-2">
            Your score: <span className="font-bold text-2xl text-blue-600">{submittedScore}</span>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Your therapist will review your responses shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <ClipboardList className="w-10 h-10 text-blue-600" />
            My Assessments
          </h1>
          <p className="text-gray-600">
            Complete assessments assigned by your therapist to track your progress
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="inline w-5 h-5 mr-2" />
            Pending
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="inline w-5 h-5 mr-2" />
            Completed
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No {activeTab} assessments
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'Your therapist hasn\'t assigned any assessments yet.'
                : 'You haven\'t completed any assessments yet.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {assignment.assessment_name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {assignment.assessment_type}
                    </span>
                  </div>
                  {assignment.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {assignment.guidance_text}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    Assigned by: {assignment.therapist_name}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {assignment.due_date 
                      ? `Due: ${new Date(assignment.due_date).toLocaleDateString()}`
                      : 'No due date'}
                  </div>
                </div>

                {assignment.status === 'pending' ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{assignment.answered_questions} / {assignment.total_questions}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${(assignment.answered_questions / assignment.total_questions) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => startAssessment(assignment)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {assignment.answered_questions > 0 ? 'Continue' : 'Start'} Assessment
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800 font-medium">Completed</p>
                        <p className="text-xs text-green-600">
                          {new Date(assignment.completed_at!).toLocaleDateString()}
                        </p>
                      </div>
                      {assignment.score !== null && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-800">{assignment.score}</p>
                          <p className="text-xs text-green-600">Score</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireAuth>
      <AssessmentsPage />
    </RequireAuth>
  );
}
