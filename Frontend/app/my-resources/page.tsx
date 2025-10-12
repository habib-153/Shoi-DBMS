'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Podcast, Link as LinkIcon, UserRound, Calendar } from 'lucide-react';

export default function MyResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.user_id) {
      fetchMyResources();
    }
  }, [user]);

  const fetchMyResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user?.user_id}/resources`);
      const data = await response.json();
      
      if (data.success) {
        setResources(data.resources || []);
      } else {
        console.error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': case 'pdf handout':
        return <FileText className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'podcast':
        return <Podcast className="w-6 h-6" />;
      case 'link': case 'url':
        return <LinkIcon className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': case 'pdf handout':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'podcast':
        return 'bg-green-100 text-green-800';
      case 'workbook':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Please log in to view your resources</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="bg-gradient-to-br from-gray-50 via-white to-[#2596be]/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#2596be]/10 text-[#2596be] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#2596be]/20">
              <BookOpen className="w-4 h-4" />
              My Resources
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources Assigned to You</h1>
            <p className="text-xl text-gray-600">
              Educational materials and resources recommended by your therapist
            </p>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be]"></div>
            </div>
          ) : resources.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Yet</h3>
              <p className="text-gray-600">
                Your therapist hasn't assigned any resources to you yet. They will appear here when assigned.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.resource_id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#2596be]/10 rounded-xl flex items-center justify-center text-[#2596be]">
                      {getResourceIcon(resource.type)}
                    </div>
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {resource.author_or_source && (
                    <p className="text-xs text-gray-500 mb-3">
                      by {resource.author_or_source}
                    </p>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    {resource.therapist_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserRound className="w-4 h-4" />
                        Assigned by {resource.therapist_name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(resource.assigned_at).toLocaleDateString()}
                    </div>
                  </div>

                  {resource.link && (
                    <Button
                      className="w-full mt-4 bg-[#2596be] hover:bg-[#1d7a99]"
                      onClick={() => window.open(resource.link, '_blank')}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Open Resource
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
