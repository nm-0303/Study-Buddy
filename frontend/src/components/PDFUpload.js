import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import axios from 'axios';

const PDFUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a PDF file.'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload_pdf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus({
        type: 'success',
        message: `PDF uploaded successfully! Processed ${response.data.num_chunks} chunks.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to upload PDF. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="card">
      <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
        Upload Your Study Material
      </h1>
      
      <div 
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {isUploading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ marginLeft: '16px' }}>Processing PDF...</p>
          </div>
        ) : (
          <>
            <Upload size={48} style={{ marginBottom: '16px', color: '#667eea' }} />
            <h3>Drop your PDF here</h3>
            <p style={{ marginTop: '8px', color: '#666' }}>
              or click to browse files
            </p>
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#888' }}>
              Supported format: PDF
            </p>
          </>
        )}
      </div>

      {uploadStatus && (
        <div className={`${uploadStatus.type === 'success' ? 'success-message' : 'error-message'}`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          ) : (
            <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          )}
          {uploadStatus.message}
        </div>
      )}

      <div className="grid" style={{ marginTop: '32px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>
            <HelpCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            How it works
          </h3>
          <p>
            Upload your PDF study material and our AI will analyze it to help you:
          </p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Get simple explanations of complex concepts</li>
            <li>Generate practice quiz questions</li>
            <li>Create interactive flashcards</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>
            <FileText size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Supported Content
          </h3>
          <p>
            Works best with educational content like:
          </p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Textbooks and course materials</li>
            <li>Research papers and articles</li>
            <li>Lecture notes and presentations</li>
            <li>Study guides and summaries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload; 