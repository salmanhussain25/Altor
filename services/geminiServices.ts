

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Lesson, ChatMessage, ProblemSolution, CourseOutline, VisualAid, AppMode, LessonStep, Hint, StepMultipleChoice, Topic, InterviewSession, InterviewRound, InterviewRoundType, ExperienceLevel, LibraryCourse, SourceLink, CourseComplexity, StepExplanation, StepCodeTask } from '../types';
import { debug } from "../utils/debug";
import { geminiLanguageMap } from '../translations';
import type { Language } from '../translations';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleApiError = (error: unknown, context: string, defaultMessage: string): Error => {
    debug("ERROR", `Gemini API Error in ${context}:`, { error });
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
        return new Error("You've reached the daily API quota for this model. Please try again tomorrow.");
    }
    return new Error(defaultMessage);
};

// Helper to clean and parse JSON, handling potential markdown fences from the model.
const cleanAndParseJson = <T>(jsonText: string): T => {
    let cleanedText = jsonText.trim();
    // Case: ```json{...}```
    if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
        if (cleanedText.endsWith("```")) {
             cleanedText = cleanedText.slice(0, -3);
        }
    }
    // Case: ```{...}```
    else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
        if (cleanedText.endsWith("```")) {
             cleanedText = cleanedText.slice(0, -3);
        }
    }

    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        debug("ERROR", "Failed to parse JSON after cleaning", { originalText: jsonText, cleanedText, error: e });
        throw new Error("The AI returned a response that could not be understood. Please try again.");
    }
};

// A robust retry mechanism with exponential backoff to handle temporary API errors or rate limits.
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
    let lastError: Error | unknown = new Error('API call failed after all retries.');
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            debug('WARN', `API call failed on attempt ${i + 1}/${maxRetries}. Retrying...`, { error });
            if (i < maxRetries - 1) {
                // Exponential backoff: wait 1s, 2s, 4s...
                const delay = 1000 * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
};


// Helper function to convert a File object to a Gemini-compatible Part.
async function fileToGenerativePart(file: File) {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type
    }
  };
}


const P5JS_GUIDE = `You are an expert P5.js developer. When asked to generate a p5.js sketch for a 'visualAid' object, you must provide the raw JavaScript code for the 'content' property.

**RULES FOR THE P5.JS CODE:**
- The animation MUST be creative, realistic, accurate, and visually representative of the concept.
- It MUST be self-contained. Do not use any external assets or files.
- It MUST be responsive. Use 'createCanvas(windowWidth, windowHeight);' in the setup() function.
- It MUST include both setup() and draw() functions.
- The draw() function MUST clear the background on each frame to create smooth animation.
- Include interactivity (e.g., using mouseX, mouseY, mouseIsPressed) if it helps to demonstrate the concept more effectively.
- Do NOT wrap the code in markdown fences or add any commentary.

**RULES FOR SOUND (USING p5.sound.js):**
- You MUST use the 'p5.sound.js' library to add sound effects that are relevant to the animation.
- Sounds MUST be synthesized using 'p5.Oscillator' and 'p5.Env'. Do NOT use 'loadSound()' or any external audio files.
- To comply with browser autoplay policies, you MUST include a 'mousePressed()' function that calls 'userStartAudio()' to enable sound on user interaction.
- Trigger sounds at meaningful moments in the animation (e.g., collisions, state changes, user interactions).
- Keep sounds simple and short. Avoid continuous, annoying noises.
`;

const THREEJS_GUIDE = `You are an expert Three.js developer. When asked to generate a 'threejs' visual aid, you must provide the raw JavaScript code for the 'content' property.

**RULES FOR THE THREE.JS CODE:**
- The code MUST be a standard ES module.
- It MUST default export a function that accepts one argument: a 'container' DOM element.
- This function MUST:
  1. Import 'three' and 'OrbitControls': \`import * as THREE from 'three';\` and \`import { OrbitControls } from 'three/addons/controls/OrbitControls.js';\`
  2. Create a THREE.Scene, a THREE.Camera, and a THREE.WebGLRenderer.
  3. Set the renderer's size to the container's width and height and append its DOM element to the container.
  4. **CRITICAL: You MUST include OrbitControls for camera interaction.** Instantiate it and call \`controls.update()\` inside the animation loop.
  5. Create a responsive animation loop using 'requestAnimationFrame'. Handle window resizing.
  6. Add objects to the scene to create a visually representative animation of the concept.
  7. Return a "cleanup" function that stops the animation loop and disposes of all Three.js objects (renderer, controls, geometry, materials) to prevent memory leaks.
- The animation MUST be creative, realistic, and accurate.
- It MUST be self-contained. Do not use any external assets, files, or other libraries.
- Do NOT wrap the code in markdown fences or add any commentary.

**EXAMPLE STRUCTURE:**
\`\`\`javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function(container) {
  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // ... create objects ...
  camera.position.z = 5;

  // CRITICAL: animationFrameId must be declared here to be accessible in the cleanup function.
  let animationFrameId;

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    controls.update(); // Update controls in the loop
    // ... animation logic ...
    renderer.render(scene, camera);
  }
  animate();

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onWindowResize);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onWindowResize);
    controls.dispose();
    // You should also dispose geometries, materials, textures.
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}
\`\`\`
`;

const visualAidSchema = {
    type: Type.OBJECT,
    description: "An animation to explain a concept. Required for any visualizable topic.",
    properties: {
        title: { type: Type.STRING, description: 'A clear, descriptive title for the animation.' },
        type: { type: Type.STRING, enum: ['p5js', 'threejs'] },
        content: { type: Type.STRING, description: 'The animation sketch code, following all rules in the relevant guide.' }
    },
    required: ['title', 'type', 'content']
};


const explanationStepSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['EXPLANATION'] },
        content: { type: Type.STRING, description: "A concise, beginner-friendly explanation. Keep it under 50 words." },
        visualAid: { ...visualAidSchema, description: "An animation to visually represent the concept." }
    },
    required: ['type', 'content']
};

const multipleChoiceStepSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE'] },
        question: { type: Type.STRING, description: "A clear, multiple-choice question to check understanding." },
        choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-4 potential answers." },
        correctChoiceIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the 'choices' array. This MUST be a number (e.g., 0, 1, 2). DO NOT provide the answer as a string." },
        feedback: { type: Type.STRING, description: "Positive reinforcement to show after they choose correctly. E.g., 'That's right!' or 'Great job!'."}
    },
    required: ['type', 'question', 'choices', 'correctChoiceIndex', 'feedback']
};

const codeTaskStepSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['CODE_TASK'] },
        mission: { type: Type.STRING, description: "A practical, problem-based task for the user." },
        startingCode: { type: Type.STRING, description: "Simple starting code. The user MUST modify or build upon this. Include comments in the target language." },
        visualAid: { ...visualAidSchema, description: "Optional. An animation, if helpful for this task." }
    },
    required: ['type', 'mission', 'startingCode']
};

const lessonSchema = {
    type: Type.OBJECT,
    properties: {
        topicTitle: { type: Type.STRING, description: "The title of the topic this lesson is for." },
        steps: {
            type: Type.ARRAY,
            description: "An array of 3-5 sequential, varied lesson steps.",
            items: {
                oneOf: [explanationStepSchema, multipleChoiceStepSchema, codeTaskStepSchema]
            }
        }
    },
    required: ["topicTitle", "steps"],
};


const hintSchema = {
    type: Type.OBJECT,
    description: "A set of tiered hints to help the user if their code is incorrect.",
    properties: {
        conceptual: { type: Type.STRING, description: "A high-level conceptual hint (e.g., 'Remember how loops work?')." },
        direct: { type: Type.STRING, description: "A more direct, code-focused hint (e.g., 'Check the variable name on line 5.')." },
        solution: { type: Type.STRING, description: "The complete, correct code solution." }
    },
    required: ['conceptual', 'direct', 'solution']
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: "Whether the user's code correctly solves the task."
        },
        feedback: {
            type: Type.STRING,
            description: "Brief, encouraging feedback. If correct, be enthusiastic. If incorrect, be gentle and acknowledge their attempt. Keep it under 30 words."
        },
        hint: {
            ...hintSchema,
            description: "MUST be provided if isCorrect is false. Omit if isCorrect is true."
        }
    },
    required: ["isCorrect", "feedback"],
};

const courseOutlineSchema = {
    type: Type.OBJECT,
    properties: {
        skillName: {
            type: Type.STRING,
            description: "A formal name for the skill or course, based on the user's request. E.g., 'Python for Beginners'."
        },
        topics: {
            type: Type.ARRAY,
            description: "A logically ordered array of topic objects for a beginner-to-intermediate course.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the topic." },
                    description: { type: Type.STRING, description: "A concise, one-sentence description of what this topic covers." },
                    points: { type: Type.INTEGER, description: "Points awarded for completing this topic. Standard value is 100."}
                },
                required: ["title", "description", "points"]
            }
        }
    },
    required: ["skillName", "topics"],
};


const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: {
            type: Type.STRING,
            description: "A helpful response to the user's question in a friendly, conversational tone. Keep it concise."
        },
        updatedCode: {
            type: Type.STRING,
            description: "Optional: If helpful, provide a new or modified code snippet to display on the whiteboard. Must be a complete, executable snippet with comments in the target language."
        },
        visualAid: {
            ...visualAidSchema,
            description: "An animation to support the explanation. This is MANDATORY for all responses in Tutor Mode and for all explanatory responses in Doubt Solver mode."
        }
    },
    required: ["responseText"]
};

const problemSolutionSchema = {
    type: Type.OBJECT,
    properties: {
        problemExplanation: {
            type: Type.STRING,
            description: "First, briefly explain the user's problem statement in a simple, easy-to-understand way. Keep this explanation under 40 words."
        },
        solutionExplanation: {
            type: Type.STRING,
            description: "Next, provide a step-by-step explanation of the logic for the solution in a conversational tone. Structure the explanation. Keep it under 80 words."
        },
        solutionCode: {
            type: Type.STRING,
            description: "Provide the complete, correct solution code in the detected programming language. Add comments in the target language."
        },
        language: {
            type: Type.STRING,
            description: "The name of the programming language used in the solution code (e.g., 'Python')."
        }
    },
    required: ["problemExplanation", "solutionExplanation", "solutionCode", "language"],
};

const badgeTitleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, catchy, skill-level-appropriate title for the badge (e.g., 'Python Pro')." }
    },
    required: ["title"]
};

// --- Interview Schemas ---

const interviewPlanSchema = {
    type: Type.OBJECT,
    properties: {
        rounds: {
            type: Type.ARRAY,
            description: "A logically ordered array of 4-5 interview rounds. Each round MUST have a unique interviewer.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['INTRODUCTION', 'BEHAVIOURAL', 'CODING_CHALLENGE', 'SYSTEM_DESIGN', 'RESUME_DEEP_DIVE', 'HR_WRAPUP'] },
                    title: { type: Type.STRING, description: "A clear title for the round. E.g., 'Behavioral Questions', 'Coding: Algorithms'." },
                    completed: { type: Type.BOOLEAN, description: "Set to false initially." },
                    estimatedMinutes: { type: Type.INTEGER, description: "Estimated time in minutes for this round." },
                    interviewerName: { type: Type.STRING, description: "The full name of the interviewer for this round. You MUST pick a unique name from the provided lists for each round." },
                    interviewerGender: { type: Type.STRING, enum: ['male', 'female'], description: "The gender associated with the chosen name." }
                },
                required: ["type", "title", "completed", "estimatedMinutes", "interviewerName", "interviewerGender"]
            }
        },
        openingStatement: {
            type: Type.STRING,
            description: "A friendly, professional opening statement to start the interview, in the target language. This is spoken by the first interviewer. Greet the candidate, state your name, and briefly state the interview's purpose and first round."
        }
    },
    required: ["rounds", "openingStatement"]
};


const interviewFollowUpSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: {
            type: Type.STRING,
            description: "Your response as an interviewer. Ask a follow-up question, provide a new coding challenge, give feedback, or transition to the next topic. Must be in the required language."
        },
        updatedCode: {
            type: Type.STRING,
            description: "Optional: If the round is CODING_CHALLENGE or SYSTEM_DESIGN, provide starting code or update the candidate's code with corrections/suggestions."
        },
        visualAid: {
            ...visualAidSchema,
            description: "Optional: Provide a p5.js or three.js animation for SYSTEM_DESIGN rounds."
        },
        isRoundFinished: {
            type: Type.BOOLEAN,
            description: "Set to true if you have concluded the current round and are ready to move on. Otherwise, set it to `false`."
        }
    },
    required: ["responseText", "isRoundFinished"]
};

// --- End Interview Schemas ---

export async function generateVisualAid(prompt: string, language: Language, preferredLibrary: 'p5js' | 'threejs' = 'p5js'): Promise<VisualAid> {
    const languageName = geminiLanguageMap[language];
    const guide = preferredLibrary === 'threejs' ? THREEJS_GUIDE : P5JS_GUIDE;

    const systemInstruction = `${guide}
You are an AI assistant whose ONLY task is to generate a creative ${preferredLibrary} animation based on the user's prompt.
- **Prompt**: "${prompt}"
- **Language**: The title for the animation should be in ${languageName}.
- **Output**: Your entire response MUST be a single, valid JSON object that adheres to the provided schema. The 'type' property MUST be '${preferredLibrary}'. Do not add any commentary or markdown.`;
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `Generate a ${preferredLibrary} animation for the concept: "${prompt}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: visualAidSchema,
        }
    };

    debug('API_REQUEST', 'generateVisualAid (recovery)', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateVisualAid raw response', { jsonText });
        const visualAid = cleanAndParseJson<VisualAid>(jsonText);
        if (!visualAid.title || !visualAid.content) {
            throw new Error("Invalid visual aid format from AI.");
        }
        debug('API_RESPONSE', 'generateVisualAid parsed response', { visualAid });
        return visualAid;
    } catch (error) {
        throw handleApiError(error, "generateVisualAid", "I had trouble creating an animation for that concept.");
    }
}

export async function generateLibraryCourse(prompt: string, language: Language): Promise<LibraryCourse> {
    const languageName = geminiLanguageMap[language];
    const systemInstruction = `You are an AI research assistant who creates educational presentations. Your task is to use Google Search to find high-quality PDF documents about a user's topic, extract key information, and structure it into a slide deck.
- **Goal**: Create a series of slides for each sub-topic, synthesizing information from PDFs.
- **Process**:
    1. Search the web for high-quality, educational PDF documents about "${prompt}".
    2. Identify 3-4 key sub-topics based on the available content.
    3. For each sub-topic:
       a. Write a detailed summary paragraph.
       b. Create 3-5 presentation slides ('pptSlides'). Each slide must have a 'title' and 'content' (an array of 1-3 strings for bullet points or short paragraphs).
       c. **CRITICAL**: For each slide you create, you MUST cite the original PDF it was sourced from in the 'sourcePdf' object, providing both the 'uri' and 'title' of that PDF.
    4. Compile a list of all unique PDF documents found during research into the 'pdfLinks' array for each topic.
- **Language**: All generated text (courseName, titles, summaries, slide content) MUST be in ${languageName}.
- **Output**: Your response MUST be ONLY a single, valid JSON object. Do not add any other text or markdown fences like \`\`\`json. The JSON object must have this structure: { courseName: string, topics: Array<{ title: string, summary: string, pptSlides: Array<{ title: string, content: string[], sourcePdf: {uri: string, title: string} }>, pdfLinks: Array<{uri: string, title: string}> }> }`;

    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `Generate a library course with a presentation for: "${prompt}"`,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
        }
    };

    debug('API_REQUEST', 'generateLibraryCourse', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateLibraryCourse raw response', { jsonText });

        const courseData = cleanAndParseJson<any>(jsonText);
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map(c => c.web)
            .filter((web): web is SourceLink => !!web?.uri && !!web?.title) || [];

        // Add unique IDs to topics
        const topicsWithIds = courseData.topics.map((topic: any, index: number) => ({
            ...topic,
            id: `lib-topic-${Date.now()}-${index}`
        }));

        const finalCourse: LibraryCourse = {
            ...courseData,
            topics: topicsWithIds,
            allSources: sources
        };
        
        if (!finalCourse.courseName || !Array.isArray(finalCourse.topics)) {
            throw new Error("Invalid library course format from AI.");
        }

        debug('API_RESPONSE', 'generateLibraryCourse parsed response', { finalCourse });
        return finalCourse;

    } catch (error) {
        throw handleApiError(error, "generateLibraryCourse", "I had trouble researching that topic. It might be too specific, or there could be a network issue. Please try a different topic.");
    }
}


export async function generateInterviewPlan(
    cvFile: File | undefined, 
    cvText: string | undefined, 
    company: string | undefined, 
    role: string | undefined,
    experienceLevel: ExperienceLevel,
    maleNames: string[],
    femaleNames: string[],
    language: Language
): Promise<{ rounds: InterviewRound[], openingStatement: string }> {
    const languageName = geminiLanguageMap[language];
    const systemInstruction = `You are a world-class hiring manager. You are preparing to interview a candidate.
- **Goal**: Create a realistic, structured interview plan with a diverse panel of interviewers.
- **Language**: All text you generate (round titles, opening statement) MUST be in conversational ${languageName}.
- **CV Analysis**: Analyze the provided CV content (from text or file) to understand the candidate's skills and experience.
- **Role/Company Context**: Tailor the interview rounds and their titles for the role of "${role || 'a software engineer'}" at "${company || 'a leading tech company'}".
- **Experience Level**: The candidate is a/an "${experienceLevel}" candidate. Tailor the questions accordingly. For FRESHERs, focus on fundamentals, projects, and potential. For EXPERIENCED candidates, ask about past projects, impact, leadership, and advanced technical/design challenges.
- **Interview Panel**: You MUST assign a different interviewer to each round. Pick names from the provided lists. Ensure a mix of genders.
- **Opening Statement**: The first interviewer MUST introduce themselves by name in the \`openingStatement\`, in ${languageName}.
- **Output**: Your response MUST be a single JSON object matching the required schema.`;

    const parts = [];
    let prompt = `Please generate an interview plan for the role of "${role}" at "${company}" for a ${experienceLevel} candidate.
Available male interviewer names: ${maleNames.join(', ')}.
Available female interviewer names: ${femaleNames.join(', ')}.
Assign a unique interviewer to each round.`;
    
    if (cvFile) {
        prompt += " The candidate's CV is attached.";
        parts.push({ text: prompt });
        parts.push(await fileToGenerativePart(cvFile));
    } else if (cvText) {
        prompt += ` Here is the candidate's CV text: \n\n${cvText}`;
        parts.push({ text: prompt });
    } else {
        parts.push({ text: prompt });
    }

    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: interviewPlanSchema,
        }
    };

    debug('API_REQUEST', 'generateInterviewPlan', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateInterviewPlan raw response', { jsonText });
        const plan = cleanAndParseJson<{ rounds: InterviewRound[], openingStatement: string }>(jsonText);
        if (!plan.rounds || !plan.openingStatement) {
            throw new Error("Invalid interview plan format from AI.");
        }
        debug('API_RESPONSE', 'generateInterviewPlan parsed response', { plan });
        return plan;
    } catch (error) {
        throw handleApiError(error, "generateInterviewPlan", "I had trouble preparing the interview plan. Please check the inputs and try again.");
    }
}


export async function generateInterviewFollowUp(
    session: InterviewSession,
    history: ChatMessage[],
    userCode: string,
    userResponse: string,
    language: Language
): Promise<{ responseText: string; updatedCode?: string; visualAid?: VisualAid, isRoundFinished: boolean }> {
    const currentRound = session.rounds[session.currentRoundIndex];
    const isCodingRound = currentRound.type === 'CODING_CHALLENGE' || currentRound.type === 'SYSTEM_DESIGN';
    const languageName = geminiLanguageMap[language];

    const systemInstruction = `${P5JS_GUIDE}
${THREEJS_GUIDE}
You are ${currentRound.interviewerName}, a professional interviewer for "${session.company}" conducting an interview for the "${session.role}" position. You must stay in character as ${currentRound.interviewerName}.

**CANDIDATE CONTEXT:**
- **CV**: ${session.cvText || '(Not provided)'}
- **Level**: ${session.experienceLevel}
- **Conversation History**:
${history.map(m => `${m.sender}: ${m.text}`).join('\n')}
${isCodingRound ? `- **Candidate's Whiteboard Code**:\n\`\`\`\n${userCode}\n\`\`\`` : ''}

**CURRENT ROUND:**
- **Title**: ${currentRound.title}
- **Type**: ${currentRound.type}

**YOUR TASK:**
Based on the candidate's latest response ("${userResponse}"), continue the interview by following the specific instructions for the current round type.

---
**ROUND-SPECIFIC INSTRUCTIONS:**

**IF Round Type is 'INTRODUCTION', 'BEHAVIOURAL', 'RESUME_DEEP_DIVE', or 'HR_WRAPUP':**
- Your role is conversational. Ask questions about the candidate's experience, resume, or situational questions.
- **You MUST NOT ask the candidate to write code.**
- **You MUST NOT refer to the whiteboard.**
- **You MUST NOT provide an \`updatedCode\` or \`visualAid\` in your JSON response.** Your response should only contain \`responseText\` and \`isRoundFinished\`.
- Keep the conversation flowing naturally.

**IF Round Type is 'CODING_CHALLENGE':**
- Your role is a technical evaluator.
- If this is the start of the challenge, you **MUST** provide a clear, well-defined coding problem statement in your \`responseText\`.
- You may provide starter code in the \`updatedCode\` field if necessary.
- After the candidate submits code (indicated by a message like "I've written my code..."), you MUST evaluate it. Provide feedback on correctness, time/space complexity, and potential optimizations.
- You can ask follow-up questions about their code.

**IF Round Type is 'SYSTEM_DESIGN':**
- Your role is a system architect.
- Provide a high-level system design problem (e.g., "Design a URL shortener," "Design Twitter's feed").
- The candidate may respond with text or you may ask them to create a diagram.
- You **MUST** use \`visualAid\` to show animations of architectures or data flows to make the discussion more concrete and visual. Prefer 'threejs' for 3D concepts and 'p5js' for 2D flows.

**GENERAL INSTRUCTIONS:**
1.  **Language**: Your entire response (\`responseText\`) MUST be in conversational ${languageName}.
2.  **Introduction**: If this is your first time speaking in this round (indicated by a system message in the history), you MUST introduce yourself (e.g., "Hello, my name is ${currentRound.interviewerName}...") before your first question.
3.  **Control the Flow**: After a few interactions, decide if the round is complete. If so, set \`isRoundFinished: true\`. Otherwise, set it to \`false\`.
4.  **JSON Output**: Your entire response MUST be a single JSON object matching the schema.
---`;

    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `The candidate responded: "${userResponse}". Continue the interview.`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: interviewFollowUpSchema,
        }
    };
    
    debug('API_REQUEST', 'generateInterviewFollowUp', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateInterviewFollowUp raw response', { jsonText });
        const followUp = cleanAndParseJson<{ responseText: string; updatedCode?: string; visualAid?: VisualAid | string, isRoundFinished: boolean }>(jsonText);

        if (followUp.visualAid && typeof followUp.visualAid === 'string') {
            try {
                followUp.visualAid = JSON.parse(followUp.visualAid);
                debug('INFO', 'Successfully recovered stringified visualAid object in interview response.');
            } catch(e) {
                debug('WARN', 'Failed to parse stringified visualAid in interview, discarding.', { visualAid: followUp.visualAid, error: e });
                followUp.visualAid = undefined;
            }
        }
        
        if (currentRound.type === 'SYSTEM_DESIGN' && !followUp.visualAid) {
            debug('WARN', 'Interview follow-up is missing a visualAid for system design round. Attempting recovery...', { responseText: followUp.responseText });
            try {
                const recoveredAid = await generateVisualAid(followUp.responseText, language, 'threejs');
                followUp.visualAid = recoveredAid;
                debug('INFO', 'Successfully recovered visualAid for interview follow-up.');
            } catch (recoveryError) {
                debug('ERROR', 'Failed to recover visualAid for interview follow-up.', { error: recoveryError });
            }
        }
        
        if (!followUp.responseText || typeof followUp.isRoundFinished !== 'boolean') {
            throw new Error("Invalid interview follow-up format from AI.");
        }
        debug('API_RESPONSE', 'generateInterviewFollowUp parsed response', { followUp });
        return followUp as { responseText: string; updatedCode?: string; visualAid?: VisualAid, isRoundFinished: boolean };
    } catch (error) {
        throw handleApiError(error, "generateInterviewFollowUp", "Sorry, I'm having a moment of network latency. Could you please repeat that?");
    }
}


export async function generateProblemSolution(problem: string, language: Language, file?: File): Promise<ProblemSolution> {
    const languageName = geminiLanguageMap[language];
    const systemInstruction = `You are an expert AI programming doubt-solving tutor. The user has provided a programming problem via text or an image. Your task is to analyze it and provide a comprehensive solution and code.
- **Analyze**: Read the problem carefully from the provided text or image.
- **Explain**: First, explain the problem itself. Then, explain the logic of your solution step-by-step. Make your explanations conversational.
- **Code**: Provide the full, correct solution code. Comment the code.
- **Language**: All text and comments must be in ${languageName}.
- **Format**: Your response MUST be in the specified JSON format.`;
    
    const parts = [];
    if (file) {
        parts.push({ text: "Please analyze the programming problem in the attached file and provide a comprehensive solution." });
        const filePart = await fileToGenerativePart(file);
        parts.push(filePart);
    } else {
        parts.push({ text: `Here is the programming problem: ${problem}` });
    }
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: problemSolutionSchema,
        }
    };

    debug('API_REQUEST', 'generateProblemSolution', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateProblemSolution raw response', { jsonText });
        const solution = cleanAndParseJson<ProblemSolution>(jsonText);
        if (!solution.problemExplanation || !solution.solutionExplanation || !solution.solutionCode || !solution.language) {
            throw new Error("Invalid solution format from AI.");
        }
        debug('API_RESPONSE', 'generateProblemSolution parsed response', { solution });
        return solution;
    } catch (error) {
        throw handleApiError(error, "generateProblemSolution", "I had trouble solving that problem. Please try rephrasing it or checking the uploaded file.");
    }
}

export async function generateBadgeTitle(skillName: string, topics: Topic[]): Promise<string> {
    const topicList = topics.map(t => t.title).join(', ');
    const systemInstruction = `You are a creative assistant who generates cool, motivational badge titles.
- **Goal**: Create a short, catchy, and skill-level-appropriate title for a certificate/badge.
- **Context**: The user has just completed a course called "${skillName}" which included these topics: ${topicList}.
- **Tone**: The title should be inspiring and sound like a real achievement. Examples: "JavaScript Voyager", "Python Trailblazer", "CSS Sorcerer".
- **Output**: Your response MUST be a single JSON object with a single "title" key, matching the schema.`;
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `Generate a badge title for completing the "${skillName}" course.`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: badgeTitleSchema,
        }
    };

    debug('API_REQUEST', 'generateBadgeTitle', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateBadgeTitle raw response', { jsonText });
        const result = cleanAndParseJson<{ title: string }>(jsonText);
        if (typeof result.title !== 'string') {
            throw new Error("Invalid title format from AI.");
        }
        debug('API_RESPONSE', 'generateBadgeTitle parsed response', { title: result.title });
        return result.title;
    } catch (error) {
        throw handleApiError(error, "generateBadgeTitle", "Creative Spark"); // Default title
    }
}

export async function generateCourseOutline(prompt: string, numTopics: number, complexity: CourseComplexity, language: Language): Promise<CourseOutline> {
    const languageName = geminiLanguageMap[language];
    const systemInstruction = `You are an expert curriculum designer. A user wants to learn a new skill. Based on their request, generate a concise curriculum outline tailored to their needs.
      
The user has specified the following parameters:
- **Complexity**: "${complexity}". Your topics and their descriptions MUST reflect this level. For 'Beginner', focus on core concepts and fundamentals. For 'Intermediate', assume basic knowledge and cover more practical, in-depth applications. For 'Advanced', cover complex, specialized, and expert-level topics.
- **Number of Topics**: Create exactly ${numTopics} essential topic objects.

All text ('skillName', 'title', 'description') must be in ${languageName}.
Your response MUST be in the specified JSON format and adhere to the schema.`;
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `Generate a curriculum for: ${prompt}`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: courseOutlineSchema,
        }
    };
    
    debug('API_REQUEST', 'generateCourseOutline', { payload: requestPayload });
    
    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateCourseOutline raw response', { jsonText });
        const curriculum = cleanAndParseJson<CourseOutline>(jsonText);
        if (!curriculum.skillName || !Array.isArray(curriculum.topics)) {
            throw new Error("Invalid curriculum format from AI.");
        }
        debug('API_RESPONSE', 'generateCourseOutline parsed response', { curriculum });
        return curriculum;
    } catch (error) {
        throw handleApiError(error, "generateCourseOutline", "I had trouble designing that course. Please try a different topic.");
    }
}


export async function generateLessonContent(skillName: string, topicTitle: string, language: Language, preferredLibrary: 'p5js' | 'threejs'): Promise<Lesson> {
    const languageName = geminiLanguageMap[language];
    const guide = preferredLibrary === 'threejs' ? THREEJS_GUIDE : P5JS_GUIDE;

    const systemInstruction = `${guide}
You are an expert AI programming tutor for ${skillName}. Your goal is to teach the topic "${topicTitle}" to an absolute beginner by creating a short, interactive micro-lesson.

**INSTRUCTIONS:**
1.  **Create 3-5 Steps:** Generate a JSON object with a \`steps\` array containing 3 to 5 lesson steps.
2.  **Vary Step Types:** The steps should be a logical sequence. Start with an \`EXPLANATION\`, then check for understanding with one or more \`MULTIPLE_CHOICE\` questions.
3.  **Conditional Code Task (VERY IMPORTANT):** Only include a \`CODE_TASK\` step if the topic ("${topicTitle}") is inherently about writing code (e.g., "JavaScript Functions", "Python 'for' loops", "HTML Tables"). For purely conceptual topics (e.g., "What is a Variable?", "How DNS Works"), you **MUST NOT** include a \`CODE_TASK\`. Instead, provide more explanations or multiple-choice questions.
4.  **Language**: All user-facing text (\`content\`, \`question\`, \`feedback\`, \`mission\`, \`choices\`, comments in \`startingCode\`) **MUST** be in conversational ${languageName}.
5.  **Visual Aids:** For \`EXPLANATION\` or \`CODE_TASK\` steps, you may optionally provide an animation in the \`visualAid\` field if the concept can be visualized. The animation \`type\` in the JSON MUST be '${preferredLibrary}'.
6.  **Format**: Your entire response MUST be a single, valid JSON object that adheres to the provided schema.`;
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `Generate a micro-lesson for the topic: ${topicTitle}`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: lessonSchema,
        }
    };

    debug('API_REQUEST', 'generateLessonContent', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));

        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateLessonContent raw response', { jsonText });
        const lesson: Lesson = cleanAndParseJson<Lesson>(jsonText);
        
        if (!lesson.topicTitle || !Array.isArray(lesson.steps) || lesson.steps.length === 0) {
            throw new Error("Invalid lesson format from AI.");
        }

        // Validate and filter steps to ensure data integrity before sending to the app.
        const validatedSteps = lesson.steps.filter(step => {
            if (step.type === 'MULTIPLE_CHOICE') {
                const mcqStep = step as any; // Use 'any' to check for non-schema properties
                
                // Attempt to recover if AI sent 'correctAnswer' (string) instead of 'correctChoiceIndex' (number)
                if (mcqStep.correctAnswer && typeof mcqStep.correctAnswer === 'string' && mcqStep.choices) {
                    const foundIndex = mcqStep.choices.findIndex((c: string) => c === mcqStep.correctAnswer);
                    if (foundIndex > -1) {
                        debug('WARN', 'Recovering malformed MCQ step. Converting correctAnswer to correctChoiceIndex.', { originalStep: step });
                        (step as StepMultipleChoice).correctChoiceIndex = foundIndex;
                        delete mcqStep.correctAnswer;
                    }
                }

                const typedMcqStep = step as StepMultipleChoice;
                const isIndexValid = typedMcqStep.correctChoiceIndex !== null && 
                                     typedMcqStep.correctChoiceIndex !== undefined &&
                                     typeof typedMcqStep.correctChoiceIndex === 'number' &&
                                     typedMcqStep.choices &&
                                     typedMcqStep.correctChoiceIndex < typedMcqStep.choices.length;

                if (!isIndexValid) {
                    debug('WARN', 'Filtering out malformed MCQ step:', { step });
                    return false;
                }
            }

            // Validate VisualAid structure. If it's malformed, attempt recovery or nullify it, but keep the step.
            if (('visualAid' in step) && step.visualAid) {
                let visualAid = (step as StepExplanation | StepCodeTask).visualAid;

                // Attempt to recover if AI returns visualAid as a stringified JSON
                if (typeof visualAid === 'string') {
                    try {
                        const parsedVisualAid = JSON.parse(visualAid);
                        (step as StepExplanation | StepCodeTask).visualAid = parsedVisualAid;
                        visualAid = parsedVisualAid; // update local variable for next check
                        debug('INFO', 'Successfully recovered stringified visualAid object.');
                    } catch (e) {
                        debug('WARN', 'Failed to parse stringified visualAid, discarding.', { visualAid, error: e });
                        (step as StepExplanation | StepCodeTask).visualAid = undefined;
                    }
                }

                // Now perform the regular validation on the (potentially parsed) object
                const currentVisualAid = (step as StepExplanation | StepCodeTask).visualAid;
                if (currentVisualAid) {
                    if (typeof currentVisualAid !== 'object' || currentVisualAid === null || typeof currentVisualAid.title !== 'string' || typeof currentVisualAid.content !== 'string') {
                        debug('WARN', 'Discarding malformed visualAid object after final check:', { visualAid: currentVisualAid, stepType: step.type });
                        (step as StepExplanation | StepCodeTask).visualAid = undefined;
                    }
                }
            }

            return true;
        });

        if (validatedSteps.length === 0 && lesson.steps.length > 0) {
            throw new Error("The AI returned a lesson where all steps were invalid. Please try generating it again.");
        }
        
        lesson.steps = validatedSteps;
        debug('API_RESPONSE', 'generateLessonContent parsed and validated response', { lesson });
        return lesson;

    } catch (error) {
        throw handleApiError(error, "generateLessonContent", "I had trouble preparing the next lesson. Please try again.");
    }
}


export async function evaluateCode(
    skillName: string, 
    task: string, 
    userCode: string,
    attemptNumber: number,
    language: Language
): Promise<{ isCorrect: boolean; feedback: string; hint?: Hint }> {
    const languageName = geminiLanguageMap[language];
    const systemInstruction = `You are an expert and friendly code evaluation assistant for ${skillName}. Your only job is to determine if the user's code works correctly.

**CRITICAL EVALUATION RULES:**
1.  **TEXT-MATCHING PRIORITY:** First, analyze the task. If it is a simple typing exercise or asks the user to type a specific phrase (like "Type the following phrase..."), your ONLY job is to check if the user's submission is an exact match to the required phrase. Ignore case and leading/trailing whitespace for this comparison. Do not evaluate it as code.
2.  **FUNCTION OVER FORM (FOR CODE):** If the task is a coding problem, the **only** thing that matters is if the code produces the correct output.
3.  **IGNORE STYLISTIC DIFFERENCES:** The user's solution is valid even if it uses different variable names, different loop types (e.g., \`for\` vs. \`while\`), or different logic than a "perfect" or "textbook" solution. There are many ways to solve a problem. Do NOT be strict.
4.  **REAL-TIME EVALUATION:** You must evaluate the code based on the task requirements in real-time. Do NOT compare it to a pre-defined or imagined "solution code".
5.  **BE ENCOURAGING:** Your feedback should be positive and build confidence. If the code is correct, celebrate it. If it's incorrect, be gentle.

**TASK DETAILS:**
- **Task**: "${task}".
- **User's Code**: \`\`\`${skillName.toLowerCase()}\n${userCode}\n\`\`\`
- **Attempt Number**: ${attemptNumber + 1}

**JSON OUTPUT RULES:**
- Provide all feedback and hints in ${languageName}.
- If \`isCorrect\` is \`true\`, provide enthusiastic feedback. DO NOT include the \`hint\` object.
- If \`isCorrect\` is \`false\`, you MUST provide a full \`hint\` object with three tiers of help ('conceptual', 'direct', 'solution').
- Your entire response MUST be in the specified JSON format.`;
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: `Evaluate the user's code for the task.`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: evaluationSchema,
        }
    };

    debug('API_REQUEST', 'evaluateCode', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'evaluateCode raw response', { jsonText });
        const evaluation = cleanAndParseJson<{ isCorrect: boolean; feedback: string; hint?: Hint }>(jsonText);

        if (typeof evaluation.isCorrect !== 'boolean' || typeof evaluation.feedback !== 'string') {
            throw new Error("Invalid evaluation format from AI.");
        }
        if (!evaluation.isCorrect && !evaluation.hint) {
             throw new Error("AI failed to provide a hint for the incorrect answer.");
        }
        debug('API_RESPONSE', 'evaluateCode parsed response', { evaluation });
        return evaluation;

    } catch (error) {
        throw handleApiError(error, "evaluateCode", "I had trouble evaluating your code. Please try again.");
    }
}

export async function generateChatResponse(
    skillName: string,
    lesson: Lesson | { task: string; code: string; },
    history: ChatMessage[],
    userQuery: string,
    userCode: string,
    appMode: AppMode,
    language: Language,
    preferredLibrary: 'p5js' | 'threejs',
    attachment?: File
): Promise<{ responseText: string; updatedCode?: string; visualAid?: VisualAid }> {
    const languageName = geminiLanguageMap[language];
    const guide = preferredLibrary === 'threejs' ? THREEJS_GUIDE : P5JS_GUIDE;
    
    const baseInstruction = `${guide}
You are an expert AI programming tutor for ${skillName}. Your task is to provide a helpful, concise response to the user's query, following the rules for the current mode. Your entire response MUST be a single, valid JSON object. All text must be in conversational ${languageName}.
`;
    let task, code;
    if ('steps' in lesson) {
        const codeTaskStep = lesson.steps.find(step => step.type === 'CODE_TASK');
        task = codeTaskStep?.type === 'CODE_TASK' ? codeTaskStep.mission : 'Discuss the current topic.';
        code = codeTaskStep?.type === 'CODE_TASK' ? codeTaskStep.startingCode : '';
    } else {
        task = lesson.task;
        code = lesson.code;
    }

    const tutorModeInstruction = `**MODE: TUTOR**
The user is working on the task: "${task}".
The original code example was: \`\`\`${code}\`\`\`
The user's current code is: \`\`\`${userCode}\`\`\`
The conversation history is: ${history.map(m => `${m.sender}: ${m.text}`).join('\n')}
The user just asked: "${userQuery}". ${attachment ? '(They have also provided an image for context.)' : ''}

**YOUR TASK:**
1.  **Answer & Animate (MANDATORY):** You MUST answer the user's question in \`responseText\` and you **MUST** also provide a creative ${preferredLibrary} animation in the \`visualAid\` field to visually support your explanation. This is a requirement for every response. The animation should directly relate to your answer.
2.  **Use Tools:** If helpful, also provide corrected code in \`updatedCode\`.
3.  **Follow the animation guide strictly** for the animation code. The animation 'type' in your JSON response must be '${preferredLibrary}'.
`;

    const doubtSolverModeInstruction = `**MODE: DOUBT SOLVER**
The user's original problem was: "${task}"
You provided this initial solution code: \`\`\`${code}\`\`\`
The user's current code is: \`\`\`${userCode}\`\`\`
The user just asked: "${userQuery}". ${attachment ? '(They have also provided an image for context.)' : ''}

**YOUR TASK:**
1.  **Analyze Request:** Does the user want code, or an explanation?
2.  **If Code is Requested:**
    - Your JSON response **MUST** contain the full, runnable code in the \`updatedCode\` field.
    - Your \`responseText\` **MUST** be a short confirmation, e.g., "Sure, I've updated the code on the whiteboard."
    - **DO NOT** explain the code in the \`responseText\`.
3.  **If Explanation is Requested:**
    - Provide a clear explanation in \`responseText\`. You **MUST** also provide a creative ${preferredLibrary} animation in the \`visualAid\` field to visually support your explanation.
    - **DO NOT** include the \`updatedCode\` field.
4.  **Follow the animation guide strictly** for the animation code. The animation 'type' in your JSON response must be '${preferredLibrary}'.
`;

    const systemInstruction = baseInstruction + (appMode === 'DOUBT_SOLVER' ? doubtSolverModeInstruction : tutorModeInstruction);

    const parts = [];
    parts.push({ text: `The user asks: ${userQuery}` });
    if (attachment) {
        const filePart = await fileToGenerativePart(attachment);
        parts.push(filePart);
    }
    
    const requestPayload = {
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: chatResponseSchema,
        }
    };

    debug('API_REQUEST', 'generateChatResponse', { payload: requestPayload });

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent(requestPayload));
        const jsonText = response.text.trim();
        debug('API_RESPONSE', 'generateChatResponse raw response', { jsonText });
        const chatResponse = cleanAndParseJson<{ responseText: string; updatedCode?: string; visualAid?: VisualAid | string }>(jsonText);
        
        if (chatResponse.visualAid && typeof chatResponse.visualAid === 'string') {
            try {
                chatResponse.visualAid = JSON.parse(chatResponse.visualAid);
                debug('INFO', 'Successfully recovered stringified visualAid object in chat response.');
            } catch(e) {
                debug('WARN', 'Failed to parse stringified visualAid in chat, discarding.', { visualAid: chatResponse.visualAid, error: e });
                chatResponse.visualAid = undefined;
            }
        }
        
        if (!chatResponse.visualAid && (appMode === 'TUTOR' || (appMode === 'DOUBT_SOLVER' && !chatResponse.updatedCode))) {
            debug('WARN', 'Chat response is missing a mandatory visualAid. Attempting recovery...', { responseText: chatResponse.responseText });
            try {
                const recoveredAid = await generateVisualAid(chatResponse.responseText, language, preferredLibrary);
                chatResponse.visualAid = recoveredAid;
                debug('INFO', 'Successfully recovered visualAid for chat response.');
            } catch (recoveryError) {
                debug('ERROR', 'Failed to recover visualAid for chat response.', { error: recoveryError });
            }
        }

        if (!chatResponse.responseText) {
            throw new Error("Invalid chat response format from AI.");
        }
        debug('API_RESPONSE', 'generateChatResponse parsed response', { chatResponse });
        return chatResponse as { responseText: string; updatedCode?: string; visualAid?: VisualAid };
    } catch (error) {
        throw handleApiError(error, "generateChatResponse", "I'm having a little trouble thinking right now. Could you ask that again?");
    }
}