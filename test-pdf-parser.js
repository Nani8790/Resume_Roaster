import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the Python PDF parser
const testPDFParser = async (pdfPath) => {
  console.log('Testing Python PDF parser...');
  console.log('PDF file:', pdfPath);
  
  const pythonScriptPath = path.join(__dirname, 'server/python/pdf_parser.py');
  
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [pythonScriptPath, pdfPath]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process failed with code:', code);
        console.error('Error output:', stderr);
        reject(new Error(`Python process failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        console.log('✓ Python PDF parser test successful!');
        console.log('Method used:', result.method_used);
        console.log('Text length:', result.extracted_length);
        console.log('Preview:', result.preview);
        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError);
        console.error('Raw output:', stdout);
        reject(parseError);
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      console.error('Make sure Python is installed and in PATH');
      reject(error);
    });
  });
};

// Test with a sample PDF if provided
const pdfPath = process.argv[2];
if (pdfPath) {
  testPDFParser(pdfPath)
    .then(result => {
      console.log('\n✓ Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ Test failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('Usage: node test-pdf-parser.js <path-to-pdf-file>');
  console.log('Example: node test-pdf-parser.js ./sample-resume.pdf');
}