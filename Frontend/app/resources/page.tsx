"use client";

import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import { 
  BookOpen, 
  Play, 
  Headphones, 
  Globe, 
  Heart,
  Download,
  ExternalLink,
  Search,
  Filter,
  Star,
  Clock,
  User
} from "lucide-react";

interface Resource {
  resource_id: number;
  title: string;
  type: string;
  author_or_source: string;
  description: string;
  link: string;
  created_at: string;
  assigned_at?: string;
  suggested_by?: number;
  suggested_by_name?: string;
}

function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);

  const resourceTypes = [
    { value: "all", label: "All Resources", icon: Globe },
    { value: "book", label: "Books", icon: BookOpen },
    { value: "blog", label: "Blog Posts", icon: Globe },
    { value: "podcast", label: "Podcasts", icon: Headphones },
    { value: "meditation", label: "Meditation", icon: Heart },
    { value: "video", label: "Videos", icon: Play }
  ];

  useEffect(() => {
    fetchResources();
  }, [user]);

  useEffect(() => {
    filterResources();
  }, [resources, selectedType, searchTerm, showAssignedOnly]);

  const fetchResources = async () => {
    if (!user) return;

    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") {
        params.append("type", selectedType);
      }
      params.append("userId", user.user_id?.toString() || user.therapist_id?.toString() || "");

      const response = await fetch(`/api/resources?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      } else {
        console.error("Failed to fetch resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (selectedType !== "all") {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.author_or_source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showAssignedOnly) {
      filtered = filtered.filter(resource => resource.assigned_at);
    }

    setFilteredResources(filtered);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = resourceTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Globe;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      book: "bg-blue-100 text-blue-800",
      blog: "bg-green-100 text-green-800",
      podcast: "bg-purple-100 text-purple-800",
      meditation: "bg-pink-100 text-pink-800",
      video: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mental Health Resources</h1>
          <p className="text-gray-600">Discover books, articles, podcasts, and tools to support your mental wellness journey</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Assigned to You Toggle */}
            <button
              onClick={() => setShowAssignedOnly(!showAssignedOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showAssignedOnly
                  ? "bg-[#2596be] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Star className={`w-4 h-4 ${showAssignedOnly ? "fill-white" : ""}`} />
              Assigned to you
            </button>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {resourceTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedType === type.value
                        ? "bg-[#2596be] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            
            return (
              <div key={resource.resource_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#2596be]/10 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-[#2596be]" />
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  {resource.author_or_source && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      {resource.author_or_source}
                    </div>
                  )}

                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                  )}

                  {resource.assigned_at && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Star className="w-4 h-4" />
                        <span>Assigned to you</span>
                        {resource.suggested_by_name && (
                          <span>by {resource.suggested_by_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(resource.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Added {new Date(resource.created_at).toLocaleDateString()}
                    </div>
                    
                    {resource.link && (
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Access
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredResources.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No resources found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType !== "all" 
                ? "Try adjusting your search or filters" 
                : "Resources will appear here when they become available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResourcesWrapper() {
  return (
    <RequireAuth>
      <ResourcesPage />
    </RequireAuth>
  );
}