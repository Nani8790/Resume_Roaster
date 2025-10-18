import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateProReportPDF = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting Python PDF generation');
      
      // Create temporary files
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const inputFile = path.join(tempDir, `report_data_${timestamp}.json`);
      const outputFile = path.join(tempDir, `report_${timestamp}.pdf`);
      
      // Write input data to temporary file
      fs.writeFileSync(inputFile, JSON.stringify(reportData, null, 2));
      
      // Path to Python script
      const pythonScript = path.join(__dirname, '../python/pdf_generator.py');
      
      // Spawn Python process
      const pythonProcess = spawn('python', [pythonScript, inputFile, outputFile]);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        try {
          // Clean up input file
          if (fs.existsSync(inputFile)) {
            fs.unlinkSync(inputFile);
          }
          
          if (code !== 0) {
            console.error('Python PDF generation failed:', stderr);
            reject(new Error(`PDF generation failed: ${stderr}`));
            return;
          }
          
          // Parse Python output
          const result = JSON.parse(stdout);
          
          if (!result.success) {
            reject(new Error(result.error));
            return;
          }
          
          // Read the generated PDF
          if (!fs.existsSync(outputFile)) {
            reject(new Error('PDF file was not created'));
            return;
          }
          
          const pdfBuffer = fs.readFileSync(outputFile);
          
          // Clean up output file
          fs.unlinkSync(outputFile);
          
          console.log('Python PDF generation completed successfully');
          console.log('PDF size:', pdfBuffer.length, 'bytes');
          
          resolve(pdfBuffer);
          
        } catch (parseError) {
          console.error('Error processing Python output:', parseError);
          reject(new Error('Failed to process PDF generation result'));
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        
        // Clean up input file
        if (fs.existsSync(inputFile)) {
          fs.unlinkSync(inputFile);
        }
        
        reject(new Error('Failed to start PDF generation process'));
      });
      
    } catch (error) {
      console.error('PDF service error:', error);
      reject(new Error('PDF generation service error'));
    }
  });
};