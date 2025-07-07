import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const acceptedFormats = ['.pdf', '.docx', '.doc'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setError('');
    
    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError('Please upload a PDF or DOCX file only.');
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      setError('File size must be less than 5MB.');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      console.log('🚀 Upload: Starting file upload...');
      const result = await apiService.uploadResume(file);
      
      console.log('📦 Upload: API result received:', result);
      console.log('📦 Upload: Result type:', typeof result);
      console.log('📦 Upload: Result keys:', Object.keys(result || {}));
      console.log('📦 Upload: Has matches?', !!result?.matches);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Navigate to results with the response data
      setTimeout(() => {
        console.log('🎯 Upload: Navigating to results with:', result);
        navigate('/results', { 
          state: { 
            results: result,
            uploadedFile: {
              name: file.name,
              size: file.size,
              type: file.type
            }
          } 
        });
      }, 500);
      
    } catch (err) {
      console.error('❌ Upload: Error occurred:', err);
      setError(err.message || 'Failed to upload and process resume. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upload Your Resume
          </h1>
          <p className="text-xl text-gray-600">
            Upload your resume and let our AI analyze it to find the perfect job matches for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {!uploading ? (
                <>
                  {/* Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : file
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            File Selected Successfully
                          </h3>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-8 h-8 text-blue-500" />
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">{file.name}</p>
                                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <button
                                onClick={removeFile}
                                className="p-2 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <X className="w-5 h-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadIcon className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Drop your resume here
                          </h3>
                          <p className="text-gray-600 mb-4">
                            or click to browse files
                          </p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  {file && (
                    <div className="mt-6">
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Analyze Resume & Find Jobs
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Loading State */
                <div className="text-center py-12">
                  <LoadingSpinner size="large" color="blue" />
                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">
                    Processing Your Resume
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our AI is analyzing your resume and finding the best job matches...
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">{uploadProgress}% Complete</p>
                  </div>

                  <div className="mt-8 text-left max-w-md mx-auto space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Extracting text from resume</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${uploadProgress > 30 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Analyzing skills and experience</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${uploadProgress > 60 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Fetching job opportunities</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${uploadProgress > 90 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">Matching with AI</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            {/* File Requirements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                File Requirements
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>PDF or DOCX format only</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Maximum file size: 5MB</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Clear, readable text</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Updated information</span>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Tips for Better Results
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>• Include specific skills and technologies</li>
                <li>• List your work experience clearly</li>
                <li>• Mention education and certifications</li>
                <li>• Use industry-standard keywords</li>
                <li>• Keep formatting simple and clean</li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔒 Privacy & Security
              </h3>
              <p className="text-sm text-gray-700">
                Your resume is processed securely and deleted after analysis. 
                We don't store your personal information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;