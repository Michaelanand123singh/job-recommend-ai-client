import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { apiService, apiUtils } from '../services/api';

const JobResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);

  // Initialize results from navigation state
  useEffect(() => {
    console.log('📍 ResultsPage: Location state:', location.state);
    console.log('📍 ResultsPage: Results from state:', location.state?.results);
    
    if (location.state?.results) {
      console.log('✅ JobResults: Setting results from navigation state');
      setResults(location.state.results);
      setLoading(false);
    } else {
      console.log('❌ JobResults: No results in navigation state, redirecting to upload');
      setError('No results available. Please upload your resume again.');
      setLoading(false);
      // Optionally redirect back to upload after a delay
      setTimeout(() => {
        navigate('/upload', { replace: true });
      }, 3000);
    }
  }, [location.state, navigate]);

  // Comprehensive debugging
  useEffect(() => {
    console.log('🔍 JobResults Debug Information:');
    console.log('  - results prop:', results);
    console.log('  - results type:', typeof results);
    console.log('  - results keys:', results ? Object.keys(results) : 'null');
    console.log('  - loading:', loading);
    console.log('  - error:', error);
    console.log('  - uploadedFile:', location.state?.uploadedFile);
    
    if (results) {
      console.log('  - results.matches:', results.matches);
      console.log('  - results.results:', results.results);
      console.log('  - results.results?.matches:', results.results?.matches);
      console.log('  - Array.isArray(results):', Array.isArray(results));
      
      if (results.matches) {
        console.log('  - matches length:', results.matches.length);
        console.log('  - first match:', results.matches[0]);
      }
      
      if (results.results?.matches) {
        console.log('  - nested matches length:', results.results.matches.length);
        console.log('  - first nested match:', results.results.matches[0]);
      }
    }
  }, [results, loading, error, location.state?.uploadedFile]);

  // Use useCallback to prevent recreating function on every render
  const fetchRecommendations = useCallback(async () => {
    if (!results) return;
    
    setRecommendationLoading(true);
    setRecommendationError(null);
    
    try {
      const response = await apiService.getJobRecommendations({
        resume_data: results,
        preferences: {
          location: 'remote',
          job_type: 'full-time',
          salary_range: 'competitive'
        }
      });
      setRecommendations(response);
    } catch (err) {
      setRecommendationError(apiUtils.formatErrorMessage(err));
    } finally {
      setRecommendationLoading(false);
    }
  }, [results]);

  // Fetch recommendations when component mounts with uploaded file
  useEffect(() => {
    if (location.state?.uploadedFile && results && !recommendations && !recommendationLoading) {
      fetchRecommendations();
    }
  }, [location.state?.uploadedFile, results, recommendations, recommendationLoading, fetchRecommendations]);

  // Handle back to upload navigation
  const handleBackToUpload = () => {
    navigate('/upload', { replace: true });
  };

  // Add debug logging
  console.log('🎨 JobResults: Rendering with:', {
    results,
    loading,
    error,
    hasResults: !!results,
    resultsType: typeof results,
    resultsKeys: results ? Object.keys(results) : null
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Analyzing your resume...</h2>
          <p className="text-gray-500 mt-2">Finding the best job matches for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || recommendationError) {
    const errorMessage = error || recommendationError;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Processing Resume</h2>
          <p className="text-gray-500 mb-6">{apiUtils.formatErrorMessage(errorMessage)}</p>
          <div className="space-y-2">
            <button
              onClick={handleBackToUpload}
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            {recommendationError && (
              <button
                onClick={fetchRecommendations}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retry Recommendations
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Try multiple ways to extract jobs data
  let jobs = [];
  
  console.log('🎯 Extracting jobs data...');
  console.log('🎯 Results structure:', results);
  
  // Try recommendations first
  if (recommendations?.matches) {
    console.log('🎯 Using recommendations.matches');
    jobs = recommendations.matches;
  }
  // Try direct matches
  else if (results?.matches) {
    console.log('🎯 Using results.matches');
    jobs = results.matches;
  }
  // Try nested results
  else if (results?.results?.matches) {
    console.log('🎯 Using results.results.matches');
    jobs = results.results.matches;
  }
  // Try if results is an array
  else if (Array.isArray(results)) {
    console.log('🎯 Using results as array');
    jobs = results;
  }
  // Try if results itself is a single job
  else if (results && typeof results === 'object' && results.title) {
    console.log('🎯 Using results as single job');
    jobs = [results];
  }
  // Last resort - create mock data to test UI
  else {
    console.log('🎯 No valid job data found, results:', results);
    jobs = [];
  }

  console.log('🎯 Final jobs array:', jobs);
  console.log('🎯 Jobs count:', jobs.length);

  // No results state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find any job matches. 
            {results ? ' Data was received but no jobs found.' : ' No data received from server.'}
          </p>
          <div className="text-xs text-gray-400 mb-4">
            Debug: Results = {results ? 'Present' : 'Null/Undefined'}
          </div>
          <button
            onClick={handleBackToUpload}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upload Another Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
          <strong>Debug Info:</strong><br/>
          Jobs found: {jobs.length}<br/>
          Results type: {typeof results}<br/>
          Has matches: {!!results?.matches}<br/>
          Has nested matches: {!!results?.results?.matches}<br/>
          Is array: {Array.isArray(results)}<br/>
          Check console for detailed logs
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Job Matches</h1>
          <p className="text-lg text-gray-600">
            Found {jobs.length} perfect matches for your profile
            {recommendationLoading && <span className="ml-2 text-indigo-600">• Getting recommendations...</span>}
          </p>
          <button
            onClick={handleBackToUpload}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Upload New Resume
          </button>
        </div>

        {/* Recommendation Status */}
        {recommendationLoading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-700">Getting personalized recommendations...</span>
            </div>
          </div>
        )}

        {/* Resume Summary */}
        {(results?.resume_summary || recommendations?.resume_summary) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Resume Summary</h2>
            <p className="text-gray-700 leading-relaxed">
              {recommendations?.resume_summary || results?.resume_summary}
            </p>
          </div>
        )}

        {/* Job Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, index) => {
            console.log(`🃏 Rendering job ${index}:`, job);
            
            return (
              <JobCard 
                key={job.id || `job-${index}`} 
                job={{
                  id: job.id || `job-${index}`,
                  title: job.job_title || job.title || 'Untitled Position',
                  company: job.company || 'Unknown Company',
                  location: job.location || 'Location not specified',
                  salary: job.salary || 'Not disclosed',
                  job_type: job.job_type || 'Full-time',
                  remote: job.remote || false,
                  description: job.description || 'No description available',
                  match_percentage: job.match_percentage || 0,
                  matching_skills: job.matching_skills || [],
                  missing_skills: job.missing_skills || [],
                  requirements: job.requirements || [],
                  explanation: job.explanation || null,
                  recommendation: job.recommendation || null,
                  posted_date: job.posted_date || 'Recent',
                  url: job.url || '#'
                }}
              />
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {jobs.filter(job => job.match_percentage >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Excellent Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {jobs.filter(job => job.match_percentage >= 60 && job.match_percentage < 80).length}
              </div>
              <div className="text-sm text-gray-600">Good Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {jobs.filter(job => job.remote).length}
              </div>
              <div className="text-sm text-gray-600">Remote Opportunities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobResults;