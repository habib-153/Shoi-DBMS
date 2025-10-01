"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Heart, Zap, Users, Clock, Star, Play, ArrowRight, CheckCircle } from "lucide-react";

interface Test {
  id: number;
  title: string;
  description: string;
  duration: string;
  questions: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  rating: number;
  completions: number;
  icon: any;
  color: string;
}

interface Game {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  benefits: string[];
  icon: any;
  color: string;
}

export default function Tests() {
  const [activeTab, setActiveTab] = useState<"tests" | "games">("tests");

  const mentalHealthTests: Test[] = [
    {
      id: 1,
      title: "Anxiety Assessment",
      description: "Evaluate your anxiety levels and identify potential areas of concern.",
      duration: "5-10 minutes",
      questions: 21,
      category: "Anxiety",
      difficulty: "Easy",
      rating: 4.8,
      completions: 2547,
      icon: Brain,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Depression Screening",
      description: "A comprehensive assessment to understand your mood and emotional well-being.",
      duration: "10-15 minutes",
      questions: 27,
      category: "Depression",
      difficulty: "Medium",
      rating: 4.7,
      completions: 1832,
      icon: Heart,
      color: "bg-red-500"
    },
    {
      id: 3,
      title: "Stress Level Evaluation",
      description: "Measure your current stress levels and identify stress triggers.",
      duration: "8-12 minutes",
      questions: 24,
      category: "Stress",
      difficulty: "Easy",
      rating: 4.6,
      completions: 3201,
      icon: Zap,
      color: "bg-yellow-500"
    },
    {
      id: 4,
      title: "Social Anxiety Test",
      description: "Assess your comfort level in social situations and interactions.",
      duration: "12-18 minutes",
      questions: 30,
      category: "Social Anxiety",
      difficulty: "Medium",
      rating: 4.5,
      completions: 1456,
      icon: Users,
      color: "bg-purple-500"
    },
    {
      id: 5,
      title: "Sleep Quality Assessment",
      description: "Evaluate your sleep patterns and identify potential sleep disorders.",
      duration: "6-10 minutes",
      questions: 18,
      category: "Sleep",
      difficulty: "Easy",
      rating: 4.4,
      completions: 2103,
      icon: Clock,
      color: "bg-indigo-500"
    },
    {
      id: 6,
      title: "Personality Insights",
      description: "Discover your personality traits and understand your behavioral patterns.",
      duration: "20-30 minutes",
      questions: 60,
      category: "Personality",
      difficulty: "Advanced",
      rating: 4.9,
      completions: 987,
      icon: Star,
      color: "bg-green-500"
    }
  ];

  const mentalHealthGames: Game[] = [
    {
      id: 1,
      title: "Mindfulness Breathing",
      description: "Interactive breathing exercises to reduce stress and promote relaxation.",
      category: "Mindfulness",
      duration: "5-15 minutes",
      benefits: ["Reduces stress", "Improves focus", "Promotes relaxation"],
      icon: Heart,
      color: "bg-teal-500"
    },
    {
      id: 2,
      title: "Cognitive Flexibility Challenge",
      description: "Brain training games designed to improve mental flexibility and problem-solving.",
      category: "Cognitive Training",
      duration: "10-20 minutes",
      benefits: ["Enhances cognitive flexibility", "Improves problem-solving", "Boosts mental agility"],
      icon: Brain,
      color: "bg-orange-500"
    },
    {
      id: 3,
      title: "Mood Tracker Game",
      description: "Fun and interactive way to track your daily mood and emotional patterns.",
      category: "Mood Tracking",
      duration: "3-5 minutes",
      benefits: ["Increases self-awareness", "Tracks emotional patterns", "Promotes reflection"],
      icon: Star,
      color: "bg-pink-500"
    },
    {
      id: 4,
      title: "Gratitude Garden",
      description: "Cultivate a virtual garden by practicing gratitude and positive thinking.",
      category: "Positive Psychology",
      duration: "10-15 minutes",
      benefits: ["Promotes gratitude", "Enhances positivity", "Improves mood"],
      icon: Heart,
      color: "bg-green-500"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#2596be] to-[#1d7a99] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Mental Health Tests & Games</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover insights about your mental health through scientifically-backed assessments and engaging wellness games
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-xl shadow-sm border">
            <button
              onClick={() => setActiveTab("tests")}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "tests" 
                  ? "bg-[#2596be] text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mental Health Tests
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "games" 
                  ? "bg-[#2596be] text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Wellness Games
            </button>
          </div>
        </div>

        {/* Tests Tab */}
        {activeTab === "tests" && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Self-Assessment Tools</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Take our scientifically-validated assessments to better understand your mental health and well-being.
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
                  <p className="text-amber-700 text-sm">
                    These assessments are for educational and self-awareness purposes only. They do not replace professional 
                    mental health diagnosis or treatment. If you're experiencing severe symptoms, please consult with a qualified 
                    mental health professional immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mentalHealthTests.map((test) => {
                const IconComponent = test.icon;
                return (
                  <div key={test.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${test.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
                          <p className="text-sm text-gray-600">{test.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{test.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{test.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{test.questions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{test.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{test.completions.toLocaleString()} completed</span>
                        </div>
                      </div>
                      
                      <button className="w-full bg-[#2596be] text-white py-3 px-4 rounded-xl hover:bg-[#1d7a99] font-semibold flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Start Test
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Wellness Games</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Improve your mental well-being through engaging, science-based games and interactive exercises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mentalHealthGames.map((game) => {
                const IconComponent = game.icon;
                return (
                  <div key={game.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{game.title}</h3>
                          <p className="text-sm text-gray-600">{game.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      
                      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{game.duration}</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                        <ul className="space-y-2">
                          {game.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <button className="w-full bg-[#2596be] text-white py-3 px-4 rounded-xl hover:bg-[#1d7a99] font-semibold flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Play Game
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-[#2596be] text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Need Professional Support?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            While these tools can provide valuable insights, professional guidance is invaluable for your mental health journey. 
            Connect with our licensed therapists for personalized support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/appointments" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2596be] rounded-xl hover:bg-gray-100 font-semibold">
              Book a Session
            </Link>
            <Link href="/therapists" className="inline-flex items-center justify-center px-8 py-3 border border-white text-white rounded-xl hover:bg-white/10 font-semibold">
              Browse Therapists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}