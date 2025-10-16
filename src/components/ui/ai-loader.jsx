import { cn } from "../../utils/cn";

export const AILoader = ({ className, message = "Generating", showMessage = true }) => {
  const letters = message.split('');
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="loader-wrapper">
        {letters.map((letter, index) => (
          <span 
            key={index} 
            className="loader-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter}
          </span>
        ))}
        <div className="loader"></div>
      </div>
      {showMessage && (
        <p className="text-gray-600 mt-4 text-sm">
          AI is processing your request...
        </p>
      )}
    </div>
  );
};

export default AILoader;