import { cn } from "../../utils/cn";
import { Brain, Sparkles } from "lucide-react";

export const AILoader = ({ className, message = "AI Analysis", showMessage = true }) => {
  const letters = message.split('');
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Animated Brain Icon */}
      <div className="relative mb-4">
        <div className="relative">
          <Brain className="h-12 w-12 text-purple-600 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-4 w-4 text-yellow-500 animate-bounce" />
          </div>
        </div>
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-20"></div>
        <div className="absolute inset-2 rounded-full border-2 border-purple-400 animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {/* Animated Text */}
      <div className="loader-wrapper mb-2">
        {letters.map((letter, index) => (
          <span 
            key={index} 
            className="loader-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
      
      {showMessage && (
        <div className="text-center">
          <p className="text-gray-600 text-sm font-medium">
            AI is processing your request...
          </p>
          <div className="flex items-center justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILoader;