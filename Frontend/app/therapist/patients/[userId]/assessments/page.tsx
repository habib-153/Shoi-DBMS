"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClipboardList, ArrowLeft, Calendar, TrendingUp } from "lucide-react";

interface AssessmentResponse {
  response_answer_id: number;
  question_id: number;
  answer_value: number | null;
  free_text: string | null;
  question_text: string;
  response_type: string;
  options: string | null;
  position: number;
}

interface Assessment {
  assignment_id: number;
  assessment_id: number;
  assessment_name: string;
  assessment_type: string;
  completed_at: string;
  score: number;
  response_id: number;
  responses: AssessmentResponse[];
}

export default function PatientAssessmentsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.userId as string;
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchAssessments();
    }
  }, [patientId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/therapist/patients/${patientId}/assessments`);
      const data = await res.json();
      
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnswer = (response: AssessmentResponse) => {
    switch (response.response_type) {
      case 'scale':
        return (
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(response.answer_value || 0) * 10}%` }}
              />
            </div>
            <span className="font-semibold text-blue-600">{response.answer_value}</span>
          </div>
        );
      
      case 'multiple_choice':
        if (response.options) {
          const options = JSON.parse(response.options);
          return <span className="font-medium text-gray-800">{options[response.answer_value || 0]}</span>;
        }
        return <span className="text-gray-600">{response.free_text}</span>;
      
      case 'yes_no':
        return <span className="font-medium text-gray-800">{response.answer_value === 1 ? 'Yes' : 'No'}</span>;
      
      case 'free_text':
        return <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{response.free_text}</p>;
      
      default:
        return <span className="text-gray-600">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (selectedAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedAssessment(null)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedAssessment.assessment_name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedAssessment.completed_at).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {selectedAssessment.assessment_type}
                </span>
                <span className="font-semibold text-blue-600">
                  Score: {selectedAssessment.score}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {selectedAssessment.responses?.map((response, index) => (
                <div key={response.response_answer_id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-gray-800 font-medium">{response.question_text}</p>
                  </div>
                  <div className="ml-11">
                    {renderAnswer(response)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <ClipboardList className="w-10 h-10 text-blue-600" />
            Patient Assessment History
          </h1>
          <p className="text-gray-600">
            View completed assessments and responses
          </p>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Completed Assessments
            </h3>
            <p className="text-gray-600">
              This patient hasn't completed any assessments yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment.assignment_id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {assessment.assessment_name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {assessment.assessment_type}
                    </span>
                  </div>
                  <ClipboardList className="w-6 h-6 text-gray-400" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(assessment.completed_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-blue-600">
                      Score: {assessment.score}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {assessment.responses?.length || 0} responses
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
