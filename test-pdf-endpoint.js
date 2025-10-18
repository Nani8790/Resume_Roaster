import fs from 'fs';
import path from 'path';

// Test the PDF generation service directly
async function testPDFGeneration() {
  try {
    // Import the PDF service
    const { generateProReportPDF } = await import('./server/services/pdfService.js');
    
    // Test data
    const testData = {
      fileName: "test-resume.pdf",
      jobDescription: "Software Engineer position requiring React, Node.js, and Python skills",
      overallScore: 85,
      jobMatchScore: 78,
      analysisDate: new Date().toISOString(),
      keywordAnalysis: {
        matched: ["JavaScript", "React", "Node.js", "Git"],
        missing: ["Python", "AWS", "Docker"]
      },
      skillsGap: {
        missing: ["Python", "AWS", "Docker", "Kubernetes"]
      },
      sectionAnalysis: {},
      atsCompatibility: {
        score: 85
      },
      recommendations: [
        "Add Python programming experience to your skills section",
        "Include AWS or cloud computing experience if applicable",
        "Mention Docker containerization experience",
        "Quantify your achievements with specific metrics"
      ],
      strengths: [
        "Strong JavaScript and React experience",
        "Good project management skills",
        "Excellent communication abilities"
      ],
      criticalIssues: [
        "Missing key technical skills mentioned in job posting",
        "Lack of cloud computing experience"
      ]
    };
    
    console.log('Testing PDF generation...');
    const pdfBuffer = await generateProReportPDF(testData);
    
    console.log('PDF generated successfully!');
    console.log('Buffer size:', pdfBuffer.length, 'bytes');
    
    // Save to file for verification
    fs.writeFileSync('test-generated-report.pdf', pdfBuffer);
    console.log('PDF saved as test-generated-report.pdf');
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
}

testPDFGeneration();