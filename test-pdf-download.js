import fetch from 'node-fetch';
import fs from 'fs';

async function testPDFDownload() {
  try {
    // First test a simple API endpoint
    console.log('Testing simple API endpoint...');
    const testResponse = await fetch('http://localhost:5000/api/test');
    console.log('Test endpoint status:', testResponse.status);
    console.log('Test endpoint response:', await testResponse.text());

    console.log('\n---\n');

    // Test another resume endpoint to see if the routes are working
    console.log('Testing resume history endpoint...');
    const historyResponse = await fetch('http://localhost:5000/api/resume/history', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-for-testing'
      }
    });
    console.log('History endpoint status:', historyResponse.status);
    const historyText = await historyResponse.text();
    console.log('History endpoint response:', historyText.substring(0, 200));

    console.log('\n---\n');

    // Test the PDF endpoint with a mock request
    console.log('Testing PDF endpoint...');
    const pdfResponse = await fetch('http://localhost:5000/api/resume/pdf-report/test-file-id', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-for-testing'
      }
    });

    console.log('PDF endpoint status:', pdfResponse.status);
    console.log('PDF endpoint headers:', Object.fromEntries(pdfResponse.headers.entries()));
    
    const responseText = await pdfResponse.text();
    console.log('PDF endpoint response (first 200 chars):', responseText.substring(0, 200));

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPDFDownload();