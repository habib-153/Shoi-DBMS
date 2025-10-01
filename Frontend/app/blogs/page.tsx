"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight, Search, Filter } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  publishDate: string;
  readTime: string;
  image: string;
  tags: string[];
}

export default function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // Sample blog data - in a real app, this would come from an API
  const samplePosts: BlogPost[] = [
    {
      id: 1,
      title: "Understanding Anxiety: A Comprehensive Guide",
      excerpt: "Learn about the different types of anxiety disorders, their symptoms, and effective coping strategies.",
      content: "Full article content...",
      author: "Dr. Sarah Ahmed",
      category: "Mental Health",
      publishDate: "2025-09-25",
      readTime: "8 min read",
      image: "/blog/anxiety-guide.jpg",
      tags: ["anxiety", "mental health", "coping strategies"]
    },
    {
      id: 2,
      title: "The Importance of Self-Care in Mental Health",
      excerpt: "Discover practical self-care techniques that can significantly improve your mental well-being.",
      content: "Full article content...",
      author: "Dr. Mohammad Hassan",
      category: "Self-Care",
      publishDate: "2025-09-22",
      readTime: "6 min read",
      image: "/blog/self-care.jpg",
      tags: ["self-care", "wellness", "mental health"]
    },
    {
      id: 3,
      title: "Breaking the Stigma: Mental Health in Bangladesh",
      excerpt: "Addressing mental health stigma in our culture and promoting open conversations about mental wellness.",
      content: "Full article content...",
      author: "Dr. Fatima Khan",
      category: "Cultural Awareness",
      publishDate: "2025-09-20",
      readTime: "10 min read",
      image: "/blog/stigma-bangladesh.jpg",
      tags: ["stigma", "culture", "bangladesh", "awareness"]
    },
    {
      id: 4,
      title: "Mindfulness Meditation for Beginners",
      excerpt: "A step-by-step guide to starting your mindfulness practice and integrating it into daily life.",
      content: "Full article content...",
      author: "Dr. Rashida Ali",
      category: "Mindfulness",
      publishDate: "2025-09-18",
      readTime: "7 min read",
      image: "/blog/mindfulness.jpg",
      tags: ["mindfulness", "meditation", "stress relief"]
    },
    {
      id: 5,
      title: "Managing Depression: Hope and Healing",
      excerpt: "Understanding depression and practical strategies for managing symptoms and finding hope.",
      content: "Full article content...",
      author: "Dr. Ahmed Rahman",
      category: "Mental Health",
      publishDate: "2025-09-15",
      readTime: "9 min read",
      image: "/blog/depression-hope.jpg",
      tags: ["depression", "healing", "mental health", "therapy"]
    },
    {
      id: 6,
      title: "The Role of Family in Mental Health Recovery",
      excerpt: "How family support can make a crucial difference in mental health treatment and recovery.",
      content: "Full article content...",
      author: "Dr. Nusrat Jahan",
      category: "Family Support",
      publishDate: "2025-09-12",
      readTime: "8 min read",
      image: "/blog/family-support.jpg",
      tags: ["family", "support", "recovery", "relationships"]
    }
  ];

  const categories = ["all", "Mental Health", "Self-Care", "Cultural Awareness", "Mindfulness", "Family Support"];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(samplePosts);
      setFilteredPosts(samplePosts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#2596be] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Mental Health Blog</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Expert insights, practical tips, and inspiring stories to support your mental health journey
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2596be] focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={filteredPosts[0].image || "/blog/default.jpg"} 
                    alt={filteredPosts[0].title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="bg-[#2596be] text-white px-3 py-1 rounded-full">
                      {filteredPosts[0].category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(filteredPosts[0].publishDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {filteredPosts[0].readTime}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{filteredPosts[0].title}</h3>
                  <p className="text-gray-600 mb-6">{filteredPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{filteredPosts[0].author}</span>
                    </div>
                    <Link href={`/blogs/${filteredPosts[0].id}`} className="inline-flex items-center gap-2 text-[#2596be] hover:text-[#1d7a99] font-medium">
                      Read More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <img 
                    src={post.image || "/blog/default.jpg"} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <Link href={`/blogs/${post.id}`} className="text-[#2596be] hover:text-[#1d7a99] font-medium text-sm">
                        Read More
                      </Link>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-[#2596be] text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-6">
            Subscribe to our newsletter for the latest mental health insights and tips.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-[#2596be] px-6 py-3 rounded-xl hover:bg-gray-100 font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}