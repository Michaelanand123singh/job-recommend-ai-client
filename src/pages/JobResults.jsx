import React, { useState, useEffect } from 'react';

const JobResults = ({ results, loading, error, onBackToUpload }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCoverLetterTips, setShowCoverLetterTips] = useState({});
  const [processedResults, setProcessedResults] = useState(null);

  // Process and validate results data
  useEffect(() => {
    if (results) {
      // Handle both direct array and nested object structure
      let jobsData;
      
      if (Array.isArray(results)) {
        // If results is directly an array of jobs
        jobsData = {
          matches: results,
          total_jobs_analyzed: results.length,
          resume_summary: null,
          resume_skills: []
        };
      } else if (results.matches && Array.isArray(results.matches)) {
        // If results is an object with matches array (current structure)
        jobsData = results;
      } else {
        // If results is a single object, wrap it in an array
        jobsData = {
          matches: [results],
          total_jobs_analyzed: 1,
          resume_summary: results.resume_summary || null,
          resume_skills: results.resume_skills || []
        };
      }

      const processed = {
        ...jobsData,
        matches: jobsData.matches.map((job, index) => ({
          // Ensure each job has required fields with fallbacks
          id: job.id || `job-${index}`,
          title: job.title || 'Untitled Position',
          company: job.company || 'Unknown Company',
          location: job.location || 'Location not specified',
          description: job.description || 'No description available',
          match_percentage: job.match_percentage || 0,
          matching_skills: job.matching_skills || [],
          missing_skills: job.missing_skills || [],
          url: job.url || '#',
          salary: job.salary || 'Not disclosed',
          remote: job.remote || false,
          explanation: job.explanation || null,
          recommendation: job.recommendation || null,
          requirements: job.requirements || [],
          posted_date: job.posted_date || 'Recent',
          job_type: job.job_type || 'Full-time',
          experience_level: job.experience_level || 'Mid-level',
          source: job.source || 'Unknown'
        }))
      };
      
      console.log('Processed results:', processed); // Debug log
      setProcessedResults(processed);
    }
  }, [results]);

  // Debug: Log the results prop
  console.log('JobResults received results:', results);

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
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Processing Resume</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={onBackToUpload}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No results state
  if (!processedResults || !processedResults.matches || processedResults.matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h2>
          <p className="text-gray-500 mb-6">We couldn't find any job matches. Try uploading a different resume or check your connection.</p>
          <button
            onClick={onBackToUpload}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upload Another Resume
          </button>
        </div>
      </div>
    );
  }

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchBadge = (percentage) => {
    if (percentage >= 80) return { text: 'Excellent Match', color: 'bg-green-500' };
    if (percentage >= 60) return { text: 'Good Match', color: 'bg-yellow-500' };
    return { text: 'Moderate Match', color: 'bg-red-500' };
  };

  const toggleCoverLetterTips = (jobId) => {
    setShowCoverLetterTips(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleApplyJob = (job) => {
    if (job.url && job.url !== '#') {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Job application link is not available');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Job Matches</h1>
          <p className="text-lg text-gray-600">
            Found {processedResults.matches.length} matches 
            {processedResults.total_jobs_analyzed && ` from ${processedResults.total_jobs_analyzed} analyzed positions`}
          </p>
          <button
            onClick={onBackToUpload}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Upload New Resume
          </button>
        </div>

        {/* Resume Summary */}
        {processedResults.resume_summary && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Resume Summary</h2>
            <p className="text-gray-700 leading-relaxed">{processedResults.resume_summary}</p>
            
            {/* Resume Skills */}
            {processedResults.resume_skills && processedResults.resume_skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {processedResults.resume_skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Matches Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processedResults.matches.map((job, index) => {
            const matchBadge = getMatchBadge(job.match_percentage);
            
            return (
              <div key={job.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Job Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchColor(job.match_percentage)}`}>
                      {job.match_percentage}%
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9m8 0V9a2 2 0 012-2h4a2 2 0 012 2v7.5" />
                    </svg>
                    <span className="text-gray-700 font-medium">{job.company}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{job.location}</span>
                    {job.remote && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Remote</span>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600 text-sm">{job.posted_date} • {job.job_type}</span>
                  </div>
                  
                  {job.salary && job.salary !== 'Not disclosed' && (
                    <div className="flex items-center mb-3">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-gray-700 font-medium">{job.salary}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${matchBadge.color}`}>
                      {matchBadge.text}
                    </div>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                      {job.experience_level}
                    </span>
                  </div>
                </div>

                {/* Job Details */}
                <div className="p-6">
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
                  
                  {/* Matching Skills */}
                  {job.matching_skills && job.matching_skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-green-700 mb-2">✅ Your Matching Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {job.matching_skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {job.matching_skills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{job.matching_skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Missing Skills */}
                  {job.missing_skills && job.missing_skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">📚 Skills to Develop</h4>
                      <div className="flex flex-wrap gap-1">
                        {job.missing_skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {job.missing_skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{job.missing_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* AI Explanation */}
                  {job.explanation && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-700 mb-1">🤖 AI Analysis</h4>
                      <p className="text-blue-800 text-sm">{job.explanation}</p>
                    </div>
                  )}
                  
                  {/* Recommendation */}
                  {job.recommendation && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        💡 {job.recommendation}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApplyJob(job)}
                      disabled={!job.url || job.url === '#'}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        job.url && job.url !== '#' 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => setSelectedJob(selectedJob === job ? null : job)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                  
                  <button
                    onClick={() => toggleCoverLetterTips(job.id)}
                    className="w-full bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  >
                    {showCoverLetterTips[job.id] ? 'Hide' : 'Show'} Cover Letter Tips
                  </button>
                  
                  {/* Cover Letter Tips */}
                  {showCoverLetterTips[job.id] && (
                    <div className="mt-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-2">✍️ Cover Letter Tips</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Highlight your {job.matching_skills?.[0] || 'relevant'} experience in the opening paragraph</li>
                        <li>• Mention specific projects that used {job.matching_skills?.slice(0, 2).join(' and ') || 'relevant technologies'}</li>
                        <li>• Address how you plan to develop {job.missing_skills?.[0] || 'additional'} skills</li>
                        <li>• Research {job.company} and mention why you want to work there specifically</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedJob.posted_date} • {selectedJob.job_type} • {selectedJob.experience_level}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                    <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedJob.description}</p>
                    
                    {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {selectedJob.requirements.map((req, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {req}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Match Analysis</h3>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span>Match Score</span>
                          <span className="font-bold">{selectedJob.match_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedJob.match_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {selectedJob.explanation && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">AI Analysis</h4>
                          <p className="text-sm text-gray-600">{selectedJob.explanation}</p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleApplyJob(selectedJob)}
                        disabled={!selectedJob.url || selectedJob.url === '#'}
                        className={`w-full px-4 py-2 rounded-lg transition-colors ${
                          selectedJob.url && selectedJob.url !== '#' 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Apply for This Job
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobResults;