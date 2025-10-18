// Test if the resume routes can be imported without errors
try {
  console.log('Testing resume routes import...');
  const resumeRoutes = await import('./server/routes/resume.js');
  console.log('Resume routes imported successfully');
  console.log('Default export type:', typeof resumeRoutes.default);
} catch (error) {
  console.error('Error importing resume routes:', error);
  console.error('Error stack:', error.stack);
}