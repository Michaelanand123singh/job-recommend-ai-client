import React from 'react';

const JobCard = ({ job }) => {
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation?.toLowerCase().includes('apply immediately')) {
      return 'bg-green-500 text-white';
    }
    if (recommendation?.toLowerCase().includes('consider applying')) {
      return 'bg-blue-500 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
          <p className="text-gray-500 text-sm flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </p>
        </div>
        
        {/* Match Percentage */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchColor(job.match_percentage || 0)}`}>
          {job.match_percentage || 0}% Match
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        {/* Salary */}
        {job.salary && (
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="font-medium">{job.salary}</span>
          </div>
        )}

        {/* Job Type and Remote */}
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {job.job_type || 'Full-time'}
          </span>
          {job.remote && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              Remote
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Skills Section */}
      <div className="mb-4">
        {/* Matching Skills */}
        {job.matching_skills && job.matching_skills.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">✅ Your Matching Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.matching_skills.map((skill, index) => (
                <span key={index} className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {job.missing_skills && job.missing_skills.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📚 Skills to Develop:</h4>
            <div className="flex flex-wrap gap-1">
              {job.missing_skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                  {skill}
                </span>
              ))}
              {job.missing_skills.length > 5 && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  +{job.missing_skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* All Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.requirements.map((req, index) => (
                <span key={index} className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Explanation */}
      {job.explanation && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="text-sm font-medium text-blue-800 mb-1">🤖 AI Analysis:</h4>
          <p className="text-sm text-blue-700">{job.explanation}</p>
        </div>
      )}

      {/* Recommendation */}
      {job.recommendation && (
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(job.recommendation)}`}>
            {job.recommendation}
          </span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Posted: {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently'}
        </div>
        
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Save Job
          </button>
          
          <a
            href={job.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Apply Now
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobCard;