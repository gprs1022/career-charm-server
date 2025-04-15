import { bucket } from './firebase';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  url: string;
  key: string;
}

// Function to upload file to Firebase Storage
export const uploadToFirebase = async (file: Express.Multer.File, folder: string = 'uploads'): Promise<UploadResult> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create a unique filename
    const fileName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
    
    // Create a file reference in the bucket
    const fileRef = bucket.file(fileName);
    
    // Create a stream to write the file
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });
    
    // Return a promise that resolves when the file is uploaded
    return new Promise<UploadResult>((resolve, reject) => {
      stream.on('error', (error: Error) => {
        console.error('Error uploading to Firebase:', error);
        reject(error);
      });
      
      stream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileRef.makePublic();
          
          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          resolve({
            url: publicUrl,
            key: fileName,
          });
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });
      
      // Write the file buffer to the stream
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Caught error in uploadToFirebase:', error);
    throw error;
  }
}; 