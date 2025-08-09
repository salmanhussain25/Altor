import React, { useRef, useEffect } from 'react';
import { debug } from '../utils/debug';

interface ThreeCanvasProps {
  sketchCode: string;
  title: string;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ sketchCode, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    debug('ANIMATION', 'Rendering ThreeCanvas', { title, sketchCodeLength: sketchCode.length });

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Clean up potential markdown fences from the AI's response
    const cleanedSketchCode = sketchCode
      .replace(/^```(javascript|js)?\s*/, '')
      .replace(/```\s*$/, '');
    
    debug('ANIMATION', 'Cleaned three.js sketch code', { code: cleanedSketchCode });

    // Create a Blob from the sketch code to be used as a module
    const blob = new Blob([cleanedSketchCode], { type: 'application/javascript' });
    const sketchUrl = URL.createObjectURL(blob);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              width: 100%;
              height: 100%;
              background-color: #111827; /* gray-900 */
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-family: sans-serif;
            }
            #container {
                width: 100%;
                height: 100%;
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
           <script type="importmap">
            {
              "imports": {
                "three": "https://esm.sh/three@0.168.0",
                "three/": "https://esm.sh/three@0.168.0/"
              }
            }
          </script>
        </head>
        <body>
            <div id="container"></div>
            <div id="error-overlay">
                <h2 style="color: #fca5a5; margin-bottom: 16px;">Animation Error</h2>
                <pre id="error-message" style="white-space: pre-wrap;"></pre>
            </div>
            <script type="module">
                let cleanup;

                const handleCleanup = () => {
                  if (typeof cleanup === 'function') {
                    cleanup();
                    cleanup = null; // Prevent multiple calls
                  }
                }
                
                window.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'cleanup') {
                        handleCleanup();
                    }
                });

                window.addEventListener('beforeunload', handleCleanup);
                
                try {
                    const container = document.getElementById('container');
                    const sketchModule = await import('${sketchUrl}');
                    const sketch = sketchModule.default;

                    if (typeof sketch === 'function') {
                        cleanup = sketch(container);
                    } else {
                        throw new Error('The sketch module does not have a default export that is a function.');
                    }
                } catch(error) {
                    console.error('Three.js sketch error:', error);
                    const errorDetails = {
                        message: error.message,
                        stack: error.stack,
                        title: '${title.replace(/'/g, "\\'")}'
                    };
                    window.parent.postMessage({ type: 'three-error', error: errorDetails }, '*');
                    
                    const overlay = document.getElementById('error-overlay');
                    const errorMessageElem = document.getElementById('error-message');
                    if (overlay && errorMessageElem) {
                        errorMessageElem.textContent = errorDetails.message;
                        overlay.style.display = 'flex';
                    }
                }
            </script>
        </body>
      </html>
    `;
    
    iframe.srcdoc = htmlContent;

    // Cleanup the Blob URL and iframe content when the component unmounts or the sketch changes
    return () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'cleanup' }, '*');
      }
      URL.revokeObjectURL(sketchUrl);
      if (iframe.srcdoc) {
        iframe.srcdoc = '';
      }
    };
  }, [sketchCode, title]);

  return (
    <div className="w-full h-full bg-gray-800 flex flex-col">
      <div className="p-4 flex-shrink-0">
        <h4 className="text-xl font-bold text-gray-100 text-center">{title}</h4>
      </div>
      <div className="w-full flex-1 min-h-0 px-4 pb-4">
        <iframe
          ref={iframeRef}
          title={title}
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0 rounded-lg bg-gray-900"
          aria-label={`Animation for ${title}`}
        />
      </div>
    </div>
  );
};