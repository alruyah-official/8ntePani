import apiClient from './client';

export const uploadApi = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    // Use 'file' as the field name, commonly expected by backend systems
    formData.append('file', file);
    
    return await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    });
  },
  
  uploadMultiple: async (files, onProgress) => {
    const urls = [];
    const totalFiles = files.length;
    
    // Upload files sequentially as requested
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      const result = await uploadApi.uploadFile(file, (filePercentage) => {
        if (onProgress) {
          // Calculate the overall progress percentage across all files
          const basePercentage = (i / totalFiles) * 100;
          const currentFileContribution = (filePercentage / 100) * (100 / totalFiles);
          onProgress(Math.round(basePercentage + currentFileContribution));
        }
      });
      
      urls.push(result.url);
    }
    
    return urls;
  }
};
