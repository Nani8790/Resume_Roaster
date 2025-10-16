import AILoader from "./ai-loader";

export default function DemoOne() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Default AI Loader</h2>
        <AILoader />
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Message</h2>
        <AILoader message="Analyzing" showMessage={false} />
        <p className="text-gray-600 mt-4">Custom message below</p>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing</h2>
        <AILoader message="Processing" />
      </div>
    </div>
  );
}