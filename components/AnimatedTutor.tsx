

import React from 'react';
import { ThreeAvatar } from './ThreeAvatar';

interface AnimatedTutorProps {
  isSpeaking: boolean;
  isThinking: boolean;
  mouthShape: string;
}

export const AnimatedTutor: React.FC<AnimatedTutorProps> = ({ isSpeaking, isThinking, mouthShape }) => {

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <div className="relative w-32 h-32 md:w-36 md:h-36 mb-4">
        <ThreeAvatar isSpeaking={isSpeaking || isThinking} mouthShape={isThinking ? 'X' : mouthShape} />
      </div>
      <div className="h-16 flex items-center justify-center w-full px-4">
        {isThinking ? (
          <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-3 rounded-lg">
            <span className="text-gray-300 mr-2">Thinking...</span>
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse [animation-delay:0.4s]"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
};