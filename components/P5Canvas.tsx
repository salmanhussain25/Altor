import React, { useRef, useEffect } from 'react';
import { debug } from '../utils/debug';

interface P5CanvasProps {
  sketchCode: string;
  title: string;
  isMuted: boolean;
}

export const P5Canvas: React.FC<P5CanvasProps> = ({ sketchCode, title, isMuted }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from our iframe
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      if (event.data && event.data.type === 'p5-error') {
        debug('ERROR', 'p5.js animation script error reported from iframe', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'SET_MUTE', muted: isMuted }, '*');
  }, [isMuted]);

  useEffect(() => {
    debug('ANIMATION', 'Rendering P5Canvas', { title, sketchCodeLength: sketchCode.length });

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Clean up potential markdown fences from the AI's response
    const cleanedSketchCode = sketchCode
      .replace(/^```(javascript|js)?\s*/, '')
      .replace(/```\s*$/, '');
    
    debug('ANIMATION', 'Cleaned p5.js sketch code', { code: cleanedSketchCode });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/addons/p5.sound.min.js"></script>
          <style>
            html, body { 
              margin: 0; 
              padding: 0;
              overflow: hidden; 
              background-color: #111827; /* gray-900 for canvas background */
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              color: white;
              font-family: sans-serif;
            }
            canvas {
              display: block;
            }
            #error-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(17, 24, 39, 0.95);
              color: #f87171; /* red-400 */
              display: none;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              box-sizing: border-box;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div id="error-overlay">
            <h2 style="color: #fca5a5; margin-bottom: 16px;">Animation Error</h2>
            <pre id="error-message" style="white-space: pre-wrap;"></pre>
          </div>
          <script>
            // More robust error handling for p5.js sketches
            window.onerror = function(message, source, lineno, colno, error) {
              console.error('p5.js sketch error:', { message, source, lineno, colno, error });
              const errorDetails = {
                message: error ? error.message : message.toString(),
                stack: error ? error.stack : 'No stack trace available.',
                title: '${title.replace(/'/g, "\\'")}'
              };

              // Send error to parent window for logging
              window.parent.postMessage({ type: 'p5-error', error: errorDetails }, '*');
              
              // Display error in the iframe itself
              const overlay = document.getElementById('error-overlay');
              const errorMessageElem = document.getElementById('error-message');
              if (overlay && errorMessageElem) {
                errorMessageElem.textContent = errorDetails.message;
                overlay.style.display = 'flex';
              }
              
              // Stop the p5.js loop if it's running
              if (typeof noLoop === 'function') {
                try {
                  noLoop();
                } catch(e) {
                  // Ignore errors from noLoop if canvas wasn't created
                }
              }

              return true; // Prevents the browser's default error handler
            };

            // Listener for mute control from parent window
            window.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'SET_MUTE') {
                // Check if p5.sound is loaded and ready
                if (typeof masterVolume === 'function') {
                  masterVolume(event.data.muted ? 0 : 1, 0.1);
                }
              }
            });
            
            // The actual sketch code is injected here
            try {
              ${cleanedSketchCode}
            } catch (e) {
              window.onerror(e.message, null, null, null, e);
            }
          </script>
        </body>
      </html>
    `;
    
    // Using srcdoc to inject the full HTML content
    iframe.srcdoc = htmlContent;

  }, [sketchCode, title]);

  return (
    <div className="w-full h-full bg-gray-800 flex flex-col">
      <div className="p-4 flex-shrink-0">
        <h4 className="text-xl font-bold text-gray-100 text-center">
          {title}
        </h4>
      </div>
      <div className="w-full flex-1 min-h-0 px-4 pb-4">
        <iframe
            ref={iframeRef}
            title={title}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0 rounded-lg"
            aria-label={`Animation for ${title}`}
        />
      </div>
    </div>
  );
};