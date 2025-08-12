

// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { TutorState, Skill, Lesson, Topic, ChatMessage, AppMode, ProblemSolution, CourseOutline, VisualAid, LessonStep, Hint, UserProfile, Badge, SpeechSegment, InterviewSession, InterviewRound, StepCodeTask, ExperienceLevel, InterviewerGender, Quest, LibraryCourse, LibraryTopic, CourseComplexity } from './types';
// import { generateLessonContent, evaluateCode, generateCourseOutline, generateChatResponse, generateProblemSolution, generateBadgeTitle, generateInterviewPlan, generateInterviewFollowUp, generateLibraryCourse, generateVisualAid } from './services/geminiServices';
// import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
// import { useSpeechRecognition } from './hooks/useSpeechRecognition';
// import { useLocalStorage } from './hooks/useLocalStorage';
// import { useLanguage } from './hooks/useLanguage';
// import { useTranslations } from './hooks/useTranslations';
// import { bcp47LanguageMap } from './translations';

// import { TutorPanel } from './components/TutorPanel';
// import { Whiteboard } from './components/Whiteboard';
// import { SkillSelectionScreen } from './components/SkillSelectionScreen';
// import { ProgressTracker } from './components/ProgressTracker';
// import { Certificate } from './components/Certificate';
// import { CourseCompletionScreen } from './components/CourseCompletionScreen';
// import { TaskPanel } from './components/TaskPanel';
// import { DoubtInputPanel } from './components/DoubtInputPanel';
// import { DoubtHeader } from './components/DoubtHeader';
// import { BookOpenIcon } from './components/icons/BookOpenIcon';
// import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
// import { AuthScreen } from './components/AuthScreen';
// import { InterviewSetupScreen } from './components/InterviewSetupScreen';
// import { InterviewRoundsTracker } from './components/InterviewRoundsTracker';
// import { TransitionCurtain } from './components/TransitionCurtain';
// import { LibrarySetupScreen } from './components/LibrarySetupScreen';
// import { LibraryProgressTracker } from './components/LibraryProgressTracker';
// import { LibraryContentPanel } from './components/LibraryContentPanel';
// import { debug } from './utils/debug';
// import type { Language } from './translations';
// import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';
// import { ChevronRightIcon } from './components/icons/ChevronRightIcon';
// import { LightBulbIcon } from './components/icons/LightBulbIcon';
// import { BriefcaseIcon } from './components/icons/BriefcaseIcon';
// import { LibraryIcon } from './components/icons/LibraryIcon';

// const INDIAN_MALE_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Vivaan', 'Arjun', 'Reyansh', 'Shaurya', 'Rohan', 'Advik', 'Kabir', 'Ishaan', 'Sai', 'Dhruv', 'Aryan', 'Krish'];
// const INDIAN_FEMALE_NAMES = ['Aanya', 'Diya', 'Saanvi', 'Myra', 'Anika', 'Aarohi', 'Isha', 'Pari', 'Riya', 'Kiara', 'Ananya', 'Tara', 'Navya', 'Zara', 'Siya'];


// // Date helpers for streak calculation
// const isYesterday = (dateString: string): boolean => {
//     const date = new Date(dateString);
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     return date.toDateString() === yesterday.toDateString();
// };

// const isToday = (dateString: string): boolean => {
//     return new Date(dateString).toDateString() === new Date().toDateString();
// }

// export default function App(): React.ReactNode {
//   const [users, setUsers] = useLocalStorage<UserProfile[]>('tutor-users', []);
//   const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('tutor-currentUserId', null);
  
//   const { language } = useLanguage();
//   const { t } = useTranslations();

//   // Effect for handling language direction (RTL/LTR)
//   useEffect(() => {
//     if (language === 'ar') {
//       document.documentElement.setAttribute('dir', 'rtl');
//       document.documentElement.lang = 'ar';
//     } else {
//       document.documentElement.setAttribute('dir', 'ltr');
//       document.documentElement.lang = language;
//     }
//   }, [language]);

//   const [appMode, setAppMode] = useState<AppMode>('SELECTION');
//   const [tutorState, setTutorState] = useState<TutorState>(TutorState.IDLE);
  
//   // Tutor Mode State
//   const [currentSkillId, setCurrentSkillId] = useState<string | null>(null);
//   const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
//   const [lesson, setLesson] = useState<Lesson | null>(null);
//   const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
//   const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);
//   const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  
//   // Doubt Solver Mode State
//   const [problem, setProblem] = useState<string>('');
//   const [solution, setSolution] = useState<ProblemSolution | null>(null);

//   // Interview Prep Mode State
//   const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [transitionText, setTransitionText] = useState('');

//   // Library Mode State
//   const [libraryCourse, setLibraryCourse] = useState<LibraryCourse | null>(null);
//   const [currentLibraryTopicId, setCurrentLibraryTopicId] = useState<string | null>(null);

//   // Shared State
//   const [userCode, setUserCode] = useState<string>('');
//   const [whiteboardDisplayCode, setWhiteboardDisplayCode] = useState<string>('// Select a mode to get started!');
//   const [visualAid, setVisualAid] = useState<VisualAid | null>(null);
//   const [isVisualAidLoading, setIsVisualAidLoading] = useState<boolean>(false);
//   const [clarificationCode, setClarificationCode] = useState<string | null>(null);
//   const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [chatError, setChatError] = useState<string | null>(null);
//   const [lastFailedMessage, setLastFailedMessage] = useState<{ message: string; attachment?: File | null } | null>(null);
//   const [stateBeforeDoubt, setStateBeforeDoubt] = useState<TutorState>(TutorState.AWAITING_TASK);
//   const [viewingCertificate, setViewingCertificate] = useState<Badge | null>(null);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

//   // Delete Modal State
//   const [deleteModal, setDeleteModal] = useState({ isOpen: false, skillId: null as string | null, error: '', isLoading: false });

//   const { speak, cancel, isMuted, toggleMute, isSpeaking, spokenText, mouthShape } = useSpeechSynthesis(language);

//   const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

//   const currentSkill = useMemo(() => currentUser?.skills.find(s => s.id === currentSkillId), [currentUser, currentSkillId]);
//   const currentTopic = useMemo(() => currentSkill?.topics.find(t => t.id === currentTopicId), [currentSkill, currentTopicId]);
//   const currentStep = useMemo(() => lesson?.steps[currentStepIndex], [lesson, currentStepIndex]);
//   const currentInterviewRound = useMemo(() => interviewSession?.rounds[interviewSession.currentRoundIndex], [interviewSession]);
//   const currentLibraryTopic = useMemo(() => libraryCourse?.topics.find(t => t.id === currentLibraryTopicId), [libraryCourse, currentLibraryTopicId]);

//   const codeLanguage = useMemo(() => {
//     if (appMode === 'DOUBT_SOLVER' && solution?.language) {
//       return solution.language.toLowerCase();
//     }
//     if (appMode === 'INTERVIEW_PREP') {
//       return 'javascript'; // Default for interviews, could be adapted
//     }
//     if (appMode === 'TUTOR' && currentSkill?.name) {
//       const name = currentSkill.name.toLowerCase();
//       if (name.includes('python')) return 'python';
//       if (name.includes('javascript') || name.includes('js')) return 'javascript';
//       if (name.includes('html')) return 'html';
//       if (name.includes('css')) return 'css';
//       return 'javascript';
//     }
//     return 'javascript';
//   }, [appMode, solution, currentSkill]);

//   const triggerTransition = (text: string, duration = 2000) => {
//     setTransitionText(text);
//     setIsTransitioning(true);
//     setTimeout(() => setIsTransitioning(false), duration);
//   };
  
//   // =================================================================================
//   // CORE CALLBACKS - ORDERED TO PREVENT HOISTING ISSUES
//   // =================================================================================
//   const handleReset = useCallback(() => {
//     debug('EVENT', 'Resetting app to selection screen');
//     cancel();
//     setAppMode('SELECTION');
//     setCurrentSkillId(null);
//     setCurrentTopicId(null);
//     setLesson(null);
//     setUserCode('');
//     setConversationHistory([]);
//     setProblem('');
//     setSolution(null);
//     setVisualAid(null);
//     setIsVisualAidLoading(false);
//     setCurrentStepIndex(0);
//     setIncorrectAttempts(0);
//     setCurrentHint(null);
//     setInterviewSession(null);
//     setLibraryCourse(null);
//     setCurrentLibraryTopicId(null);
//     setTutorState(TutorState.IDLE);
//     setError(null);
//     setChatError(null);
//     setWhiteboardDisplayCode('// Select a mode to get started!')
//   }, [cancel]);

//   const handleAnswerMcq = useCallback((choiceIndex: number, isInputFromChat: boolean = false) => {
//     if (currentStep?.type !== 'MULTIPLE_CHOICE') return;

//     debug('EVENT', 'MCQ answer submitted', { choiceIndex, correctAnswer: currentStep.correctChoiceIndex, isInputFromChat });
//     if (!isInputFromChat) {
//       setConversationHistory(prev => [...prev, { sender: 'user', text: `Selected: "${currentStep.choices[choiceIndex]}"` }]);
//     }
    
//     // eslint-disable-next-line eqeqeq
//     if (choiceIndex == currentStep.correctChoiceIndex) {
//         debug('STATE', 'MCQ answer correct');
//         const feedback = currentStep.feedback || t('tutor.feedbackCorrect');
//         speak(feedback, () => setTutorState(TutorState.AWAITING_CONTINUE), language);
//     } else {
//         debug('STATE', 'MCQ answer incorrect');
//         const feedback = t('tutor.feedbackIncorrect');
//         speak(feedback, undefined, language);
//         setTutorState(TutorState.INCORRECT);
//     }
//   }, [currentStep, speak, setConversationHistory, setTutorState, t, language]);
  
//   // Ref to break circular dependency between handleNextInterviewRound and handleSendChatMessage
//   const handleNextInterviewRoundRef = useRef<() => void>(() => {});

//   const handleSendChatMessage = useCallback(async (message: string, attachment?: File | null, isSystemMessage: boolean = false) => {
//     if (!message.trim() && !attachment) return;

//     debug('CHAT', 'handleSendChatMessage triggered', { message, hasAttachment: !!attachment, isSystemMessage, currentState: TutorState[tutorState], appMode });

//     if (!isSystemMessage) {
//       const userMessage: ChatMessage = { sender: 'user', text: message };
//       setConversationHistory(prev => [...prev, userMessage]);
//     }

//     if (appMode === 'TUTOR' && tutorState === TutorState.AWAITING_CHOICE && currentStep?.type === 'MULTIPLE_CHOICE' && !isSystemMessage) {
//         const choices = currentStep.choices.map(c => c.toLowerCase());
//         const cleanedUserChoice = message.toLowerCase().replace(/[.,?]/g, '').trim();
//         const matchedIndex = choices.findIndex(c => c.includes(cleanedUserChoice));

//         if (matchedIndex > -1) {
//             debug('CHAT', 'MCQ answer detected via speech/text, handling as answer.', { choice: choices[matchedIndex], spoken: cleanedUserChoice });
//             handleAnswerMcq(matchedIndex, true);
//             return;
//         }
//         debug('CHAT', 'Speech received during MCQ, but did not match choices. Treating as a doubt.');
//     }
    
//     // If the user interrupts while the AI is explaining, we want to return to the state *after* the explanation is done.
//     const stateToSave = tutorState === TutorState.EXPLAINING ? TutorState.AWAITING_CONTINUE : tutorState;
//     debug('STATE', `Saving state before entering doubt clarification: ${TutorState[stateToSave]}`);
//     setStateBeforeDoubt(stateToSave);

//     setTutorState(TutorState.CHATTING);
//     setChatError(null);
//     setLastFailedMessage(null);

//     try {
//       let aiResponse;
//       let responseSpeechGender: InterviewerGender | Language = language;
//       const currentHistory: ChatMessage[] = isSystemMessage 
//         ? [...conversationHistory, { sender: 'user', text: message, isSystem: true }] 
//         : conversationHistory;

//       if (appMode === 'INTERVIEW_PREP') {
//         if (!interviewSession || !currentInterviewRound) throw new Error("Interview session not initialized.");
//         debug('API', 'Generating interview follow-up');
//         responseSpeechGender = currentInterviewRound.interviewerGender;
//         aiResponse = await generateInterviewFollowUp(interviewSession, currentHistory, userCode, message, language);
        
//         if (aiResponse.isRoundFinished) {
//           // The AI's response will be spoken, and then the round will transition.
//           const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse.responseText, code: aiResponse.updatedCode, visualAid: aiResponse.visualAid, isSpoken: true };
//           debug('CHAT', 'AI response received (round finished)', { aiResponse });
//           setConversationHistory(prev => [...prev, aiMessage]);
//           speak(aiResponse.responseText, () => handleNextInterviewRoundRef.current(), responseSpeechGender);
//           return; // Prevent state from being set below, as handleNext... will take over
//         }
//       } else {
//         const contextLesson = appMode === 'TUTOR' 
//             ? lesson 
//             : solution 
//             ? { task: problem, code: solution.solutionCode } 
//             : null;
        
//         const contextSkillName = appMode === 'TUTOR' 
//             ? currentSkill?.name 
//             : solution?.language;

//         if (!contextLesson || !contextSkillName || !currentUser) throw new Error("Chat context not available.");

//         debug('API', 'Generating standard chat response');
//         aiResponse = await generateChatResponse(contextSkillName, contextLesson, currentHistory, message, userCode, appMode, language, currentUser.preferredAnimationLibrary, attachment ?? undefined);
//       }
      
//       const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse.responseText, code: aiResponse.updatedCode, visualAid: aiResponse.visualAid, isSpoken: true };
      
//       debug('CHAT', 'AI response received', { aiResponse });
//       setConversationHistory(prev => [...prev, aiMessage]);
//       speak(aiResponse.responseText, undefined, responseSpeechGender);
      
//       if (aiResponse.updatedCode) {
//         setUserCode(aiResponse.updatedCode);
//         if (appMode === 'TUTOR') {
//           setClarificationCode(aiResponse.updatedCode);
//         } else {
//           setWhiteboardDisplayCode(aiResponse.updatedCode);
//         }
//       }

//       if (aiResponse.visualAid) {
//         setVisualAid(aiResponse.visualAid);
//       }
      
//       const nextState = appMode === 'TUTOR' ? TutorState.CLARIFYING_DOUBT : TutorState.AWAITING_TASK;
//       debug('STATE', `Transitioning to ${TutorState[nextState]} to await user continuation.`);
//       setTutorState(nextState);

//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
//       debug('ERROR', 'Chat failed, restoring state', { error: err, stateToRestore: TutorState[stateBeforeDoubt] });
//       setChatError(errorMsg);
//       setLastFailedMessage({ message, attachment });
//       setTutorState(stateBeforeDoubt); // Restore state on error
//     }
//   }, [conversationHistory, lesson, speak, stateBeforeDoubt, tutorState, userCode, currentSkill, appMode, solution, problem, currentStep, handleAnswerMcq, interviewSession, currentInterviewRound, language, currentUser]);

//   const handleNextInterviewRound = useCallback(() => {
//     if (!interviewSession) return;
//     const nextRoundIndex = interviewSession.currentRoundIndex + 1;
//     if (nextRoundIndex < interviewSession.rounds.length) {
//       triggerTransition(`Next Round: ${interviewSession.rounds[nextRoundIndex].title}`);
      
//       // Artificial delay to allow curtain to drop before new content appears
//       setTimeout(() => {
//         setInterviewSession(prev => prev ? ({
//           ...prev,
//           rounds: prev.rounds.map((r, i) => i === prev.currentRoundIndex ? {...r, completed: true} : r),
//           currentRoundIndex: nextRoundIndex
//         }) : null);
        
//         // This system message will trigger the AI to introduce themselves for the new round.
//         handleSendChatMessage(`Okay, I'm ready for the next round.`, undefined, true);
//       }, 1000);
//     } else {
//       // Interview finished
//       triggerTransition("Interview Complete!", 3000);
//       const endMessage = `Great job, ${currentUser?.name}! That concludes our interview. You did very well. I'll reset the session now. Feel free to start another one whenever you're ready.`;
//       const lastInterviewerGender = interviewSession.rounds[interviewSession.rounds.length - 1].interviewerGender;
//       speak(endMessage, handleReset, lastInterviewerGender);
//       setConversationHistory(prev => [...prev, { sender: 'ai', text: endMessage, isSpoken: true }]);
//       setTutorState(TutorState.COURSE_COMPLETED); // Reuse this state for the end screen
//     }
//   }, [interviewSession, currentUser, speak, handleReset, handleSendChatMessage]);

//   useEffect(() => {
//     handleNextInterviewRoundRef.current = handleNextInterviewRound;
//   }, [handleNextInterviewRound]);

//   const fetchVisualAidForStep = useCallback(async (step: LessonStep) => {
//     if (step.type !== 'EXPLANATION' || !currentUser) return;
//     debug('API', 'Fetching on-demand visual aid for explanation', { content: step.content });
//     setIsVisualAidLoading(true);
//     try {
//         const newVisualAid = await generateVisualAid(step.content, language, currentUser.preferredAnimationLibrary);
//         setVisualAid(newVisualAid);
//     } catch (err) {
//         debug('ERROR', 'Failed to fetch on-demand visual aid', { error: err });
//     } finally {
//         setIsVisualAidLoading(false);
//     }
//   }, [language, currentUser]);

//   const processStep = useCallback((step: LessonStep) => {
//     if (!step) return;
//     debug('STATE', `Processing step ${currentStepIndex + 1}/${lesson?.steps.length}: ${step.type}`, { step });

//     setVisualAid(null);
//     setIsVisualAidLoading(false);

//     let textToSpeak: string | null = null;
//     let segmentsToSpeak: SpeechSegment[] | null = null;
//     let nextState: TutorState | null = null;
//     let postSpeechState: TutorState | null = null;
//     let aiMessage: ChatMessage | null = null;

//     switch(step.type) {
//       case 'EXPLANATION':
//         textToSpeak = step.content;
//         nextState = TutorState.EXPLAINING;
//         postSpeechState = TutorState.AWAITING_CONTINUE;
//         aiMessage = { sender: 'ai', text: textToSpeak, isSpoken: true };
//         fetchVisualAidForStep(step);
//         break;
//       case 'MULTIPLE_CHOICE':
//         textToSpeak = step.question;
//         nextState = TutorState.AWAITING_CHOICE;
//         aiMessage = { sender: 'ai', text: textToSpeak, choices: step.choices, correctChoiceIndex: step.correctChoiceIndex, isSpoken: true };
//         break;
//       case 'CODE_TASK':
//         textToSpeak = step.mission;
//         if (step.visualAid) {
//             setVisualAid(step.visualAid);
//         }
//         nextState = TutorState.AWAITING_TASK;
//         aiMessage = { sender: 'ai', text: textToSpeak, visualAid: step.visualAid, isSpoken: true };
//         break;
//     }
    
//     if (nextState) setTutorState(nextState);
//     if (aiMessage) setConversationHistory(prev => [...prev, aiMessage]);

//     const onEnd = () => {
//         if (postSpeechState) {
//             setTutorState(postSpeechState);
//         }
//     };
    
//     if (segmentsToSpeak) {
//         speak(segmentsToSpeak, onEnd);
//     } else if (textToSpeak) {
//         speak(textToSpeak, onEnd, language);
//     }
//   }, [speak, setConversationHistory, setTutorState, currentStepIndex, lesson, language, fetchVisualAidForStep]);
  
//   const fetchLesson = useCallback(async () => {
//     if (!currentTopic || !currentSkill || !currentUser) {
//       if (currentSkill && currentSkill.topics.every(t => t.isCompleted)) {
//         debug('STATE', 'All topics for the skill are completed.', { skillId: currentSkill.id });
//         setTutorState(TutorState.COURSE_COMPLETED);
//       }
//       return;
//     }
    
//     debug('API', 'Fetching lesson content', { skill: currentSkill.name, topic: currentTopic.title });
//     setIsLoading(true);
//     setError(null);
//     setTutorState(TutorState.LOADING_LESSON);
//     try {
//       const lessonContent = await generateLessonContent(currentSkill.name, currentTopic.title, currentTopic.id, language, currentUser.preferredAnimationLibrary);
//       debug('API', 'Lesson content fetched successfully', { lessonContent });
//       setLesson(lessonContent);
//       setCurrentStepIndex(0);
//       setIncorrectAttempts(0);
//       setCurrentHint(null);

//       const codeTask = lessonContent.steps.find(s => s.type === 'CODE_TASK');
//       const initialCode = codeTask?.type === 'CODE_TASK' ? (codeTask as StepCodeTask).startingCode : '// Your code will appear here';
//       setUserCode(initialCode);
//       setWhiteboardDisplayCode(initialCode);

//       setClarificationCode(null);
//       setConversationHistory([]);
//       setVisualAid(null);
//       setIsVisualAidLoading(false);
      
//       if (lessonContent.steps && lessonContent.steps.length > 0) {
//         processStep(lessonContent.steps[0]);
//       } else {
//         console.warn("Lesson has no valid steps. Proceeding to next lesson.");
//         debug('WARN', 'Lesson has no valid steps. Auto-completing.', { topicId: currentTopic.id });
//         setTutorState(TutorState.CORRECT);
//       }
      
//     } catch (err) {
//       debug('ERROR', 'Failed to fetch lesson', { error: err });
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       setTutorState(TutorState.ERROR);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentTopic, currentSkill, setLesson, setUserCode, setConversationHistory, setCurrentStepIndex, processStep, setIncorrectAttempts, setCurrentHint, language, currentUser]);

//   useEffect(() => {
//     if (currentTopicId && tutorState === TutorState.LOADING_LESSON) {
//         debug('EFFECT', 'Triggering fetchLesson due to state change', { currentTopicId, tutorState: TutorState[tutorState] });
//         fetchLesson();
//     }
//   }, [currentTopicId, tutorState, fetchLesson]);

//   const handleNextStep = useCallback(async () => {
//     cancel();
//     debug('EVENT', 'handleNextStep triggered', { currentStepIndex, totalSteps: lesson?.steps.length });

//     if (!lesson || !currentUser || !currentSkill) return;

//     const nextStepIndex = currentStepIndex + 1;

//     if (nextStepIndex < lesson.steps.length) {
//       debug('STATE', 'Moving to next step', { nextStepIndex });
//       setCurrentStepIndex(nextStepIndex);
//       processStep(lesson.steps[nextStepIndex]);
//     } else {
//       debug('STATE', 'Lesson completed. Updating progress.');
//       const pointsEarned = currentTopic?.points || 100;
//       const today = new Date().toISOString().split('T')[0];
      
//       let newStreak = currentUser.currentStreak;
//       if (!currentUser.lastActivityDate || !isToday(currentUser.lastActivityDate)) {
//         if (currentUser.lastActivityDate && isYesterday(currentUser.lastActivityDate)) {
//           newStreak++;
//         } else {
//           newStreak = 1;
//         }
//       }

//       const newLongestStreak = Math.max(currentUser.longestStreak || 0, newStreak);
      
//       const activityLog = currentUser.activityLog || [];
//       const todayLogIndex = activityLog.findIndex(log => log.date === today);
//       let newActivityLog;

//       if (todayLogIndex > -1) {
//           newActivityLog = activityLog.map((log, index) => 
//               index === todayLogIndex ? { ...log, points: log.points + pointsEarned } : log
//           );
//       } else {
//           newActivityLog = [...activityLog, { date: today, points: pointsEarned }];
//       }
      
//       const updatedSkills = currentUser.skills.map(skill => 
//         skill.id === currentSkillId ? {
//           ...skill,
//           topics: skill.topics.map(topic => 
//             topic.id === currentTopic?.id ? { ...topic, isCompleted: true } : topic
//           )
//         } : skill
//       );
      
//       let updatedUser = {
//         ...currentUser,
//         skills: updatedSkills,
//         points: currentUser.points + pointsEarned,
//         currentStreak: newStreak,
//         longestStreak: newLongestStreak,
//         activityLog: newActivityLog,
//         lastActivityDate: today,
//       };

//       const completedSkill = updatedSkills.find(s => s.id === currentSkillId);
//       const allTopicsCompleted = completedSkill?.topics.every(t => t.isCompleted);
      
//       if (allTopicsCompleted && completedSkill) {
//           debug('STATE', 'Course completed', { skillName: completedSkill.name });
//           const hasBadge = updatedUser.badges.some(b => b.courseName === completedSkill.name);
//           if (!hasBadge) {
//               const badgeTitle = await generateBadgeTitle(completedSkill.name, completedSkill.topics);
//               const newBadge: Badge = {
//                 id: `badge-${completedSkill.id}-${Date.now()}`,
//                 courseName: completedSkill.name,
//                 title: badgeTitle,
//                 dateAwarded: new Date().toISOString(),
//               };
//               updatedUser = { ...updatedUser, badges: [...updatedUser.badges, newBadge] };
//               debug('GAMIFICATION', 'New badge awarded', { newBadge });
//           }
          
//           const congratsSegments: SpeechSegment[] = [
//               { text: t('completion.congratulations'), lang: language },
//               { text: `You've completed the ${completedSkill.name} course! You can view your certificate on the dashboard.`, lang: 'en' },
//           ];

//           setTutorState(TutorState.COURSE_COMPLETED);
//           speak(congratsSegments);
//       } else {
//         setTutorState(TutorState.CORRECT);
//       }

//       const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
//       debug('DATA', 'User profile updated', { updatedUser });
//       setUsers(updatedUsers);
//     }
//   }, [lesson, currentStepIndex, currentSkillId, currentTopic, cancel, processStep, speak, currentUser, users, setUsers, currentSkill, t, language]);

//   const handleRetryChat = () => {
//     if (lastFailedMessage) {
//         debug('CHAT', 'Retrying last failed chat message', { lastFailedMessage });
//         let userMessageIndex = -1;
//         for (let i = conversationHistory.length - 1; i >= 0; i--) {
//             if (conversationHistory[i].sender === 'user') {
//                 userMessageIndex = i;
//                 break;
//             }
//         }
        
//         if (userMessageIndex !== -1) {
//             setConversationHistory(prev => prev.slice(0, userMessageIndex));
//         }
//         const { message, attachment } = lastFailedMessage;
//         setLastFailedMessage(null);
//         setChatError(null);
//         handleSendChatMessage(message, attachment);
//     }
//   }

//   const isCodeTask = (appMode === 'TUTOR' && currentStep?.type === 'CODE_TASK') ||
//                      (appMode === 'INTERVIEW_PREP' && currentInterviewRound?.type === 'CODING_CHALLENGE') ||
//                      (appMode === 'INTERVIEW_PREP' && currentInterviewRound?.type === 'SYSTEM_DESIGN');

//   const handleSubmitCode = useCallback(async () => {
//     if ((appMode !== 'TUTOR' && appMode !== 'INTERVIEW_PREP') || (appMode === 'TUTOR' && (!currentSkill || currentStep?.type !== 'CODE_TASK'))) return;

//     debug('EVENT', 'Code submission triggered', { code: userCode, appMode });
//     setIsLoading(true);
//     setError(null);
//     setTutorState(TutorState.EVALUATING);
//     try {
//        // In interview mode, code submission is just another form of chat message
//        if (appMode === 'INTERVIEW_PREP') {
//           await handleSendChatMessage(`(I've written my code solution on the whiteboard. Here it is:\n\n${userCode}\n\nPlease evaluate it and provide feedback on time/space complexity, and suggest optimizations.)`);
//           setIsLoading(false);
//           // handleSendChatMessage sets the tutorState
//           return;
//        }

//       // Existing tutor mode logic
//       if (currentStep && currentStep.type === 'CODE_TASK' && currentSkill) {
//         const { isCorrect, feedback, hint } = await evaluateCode(currentSkill.name, currentStep.mission, userCode, incorrectAttempts, language);
//         debug('API', 'Code evaluation received', { isCorrect, feedback, hint });
//         setConversationHistory(prev => [...prev, { sender: 'user', text: '(Submitting code for evaluation)'}, { sender: 'ai', text: feedback, isSpoken: true }]);
        
//         if (isCorrect) {
//           setIncorrectAttempts(0);
//           setCurrentHint(null);
//           setTutorState(TutorState.AWAITING_CONTINUE);
//           speak(feedback, () => {
//             setTutorState(TutorState.AWAITING_CONTINUE)
//           }, language);
//         } else {
//           setIncorrectAttempts(prev => prev + 1);
//           setCurrentHint(hint || null);
//           speak(feedback, undefined, language);
//           setTutorState(TutorState.INCORRECT);
//         }
//       }
//     } catch (err) {
//       debug('ERROR', 'Code evaluation failed', { error: err });
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       setTutorState(TutorState.ERROR);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [appMode, currentStep, userCode, currentSkill, speak, setConversationHistory, incorrectAttempts, setIncorrectAttempts, setCurrentHint, handleSendChatMessage, language]);

//   const handleRequestHint = () => {
//     if (!currentHint) return;
//     debug('EVENT', 'Hint requested', { attemptNumber: incorrectAttempts, hint: currentHint });
    
//     let hintText = '';
//     if (incorrectAttempts === 1) {
//         hintText = `Hint: ${currentHint.conceptual}`;
//     } else if (incorrectAttempts >= 2) {
//         hintText = `Okay, here's a more direct hint: ${currentHint.direct}`;
//     }

//     if (hintText) {
//         speak(hintText, undefined, language);
//         setConversationHistory(prev => [...prev, { sender: 'ai', text: hintText, isSpoken: true }]);
//     }
//   };

//   const handleShowSolution = () => {
//       if (!currentHint?.solution) return;
//       debug('EVENT', 'Solution requested');
//       setUserCode(currentHint.solution);
//       setWhiteboardDisplayCode(currentHint.solution);
//       const text = t('tutor.solutionHint');
//       speak(text, () => {
//           setTutorState(TutorState.AWAITING_CONTINUE);
//       }, language);
//       setConversationHistory(prev => [...prev, { sender: 'ai', text, isSpoken: true }]);
//   };

//   const {
//     interimTranscript,
//     isListening,
//     startListening,
//     stopListening,
//     isSupported: isSpeechSupported,
//     error: speechError,
//   } = useSpeechRecognition({ 
//       onTranscriptEnd: (msg) => handleSendChatMessage(msg),
//       onSubmissionIntent: handleSubmitCode,
//       isCodingContext: isCodeTask,
//       lang: bcp47LanguageMap[language],
//   });

//   useEffect(() => {
//     const isAwaitingUserInput = (tutorState === TutorState.AWAITING_TASK || tutorState === TutorState.INCORRECT || tutorState === TutorState.AWAITING_CHOICE);
//     const canListen = isAwaitingUserInput && !isLoading && !isSpeaking && isSpeechSupported;

//     if (canListen && !isListening) {
//       debug('SPEECH', 'Conditions met, starting listening...');
//       startListening();
//     } else if (!canListen && isListening) {
//       debug('SPEECH', 'Conditions no longer met, stopping listening...', { tutorState: TutorState[tutorState], isLoading, isSpeaking });
//       stopListening();
//     }
//     return () => {
//         if (isListening) stopListening();
//     };
//   }, [tutorState, isLoading, isSpeechSupported, startListening, stopListening, isSpeaking, isListening]);

//   const handleSolveDoubt = useCallback(async (problemStatement: string, file?: File) => {
//     const problemText = problemStatement || `Problem from uploaded file: ${file?.name}`;
//     debug('EVENT', 'Solving doubt', { problem: problemText });
//     setProblem(problemText);
//     setIsLoading(true);
//     setError(null);
//     setTutorState(TutorState.LOADING_LESSON);
//     setConversationHistory([]);
//     setSolution(null);
//     setVisualAid(null);
//     setIsVisualAidLoading(false);
//     try {
//       const solutionContent = await generateProblemSolution(problemStatement, language, file);
//       debug('API', 'Doubt solution received', { solutionContent });
//       setSolution(solutionContent);
//       setWhiteboardDisplayCode(solutionContent.solutionCode);
//       setUserCode(solutionContent.solutionCode);
//       setClarificationCode(null);
      
//       const initialMessages: ChatMessage[] = [
//         { sender: 'ai', text: solutionContent.problemExplanation, isSpoken: true },
//         { sender: 'ai', text: solutionContent.solutionExplanation, isSpoken: true },
//       ];
//       setConversationHistory(initialMessages);

//       speak(solutionContent.problemExplanation, () => {
//         speak(solutionContent.solutionExplanation, () => {
//              const followUp = t('tutor.askQuestion');
//              speak(followUp.split('(')[0], undefined, language);
//         }, language);
//       }, language);
      
//       setTutorState(TutorState.AWAITING_TASK);
//     } catch (err) {
//       debug('ERROR', 'Doubt solving failed', { error: err });
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       setConversationHistory([{ sender: 'ai', text: err instanceof Error ? err.message : 'An unknown error occurred'}]);
//       setTutorState(TutorState.ERROR);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [speak, setProblem, setConversationHistory, setSolution, setUserCode, language, t]);

//   const handleStartInterview = useCallback(async (setup: { cvFile?: File, cvText?: string, company: string, role: string, experienceLevel: ExperienceLevel }) => {
//     debug('INTERVIEW', 'Starting interview', { setup });
//     setIsLoading(true);
//     setError(null);
//     setTutorState(TutorState.LOADING_LESSON);
//     setConversationHistory([]);
//     setInterviewSession(null);
//     setVisualAid(null);
//     setIsVisualAidLoading(false);
//     setWhiteboardDisplayCode(`// Welcome to your interview for the ${setup.role} role at ${setup.company}.`);
//     setUserCode('');

//     try {
//         const { rounds, openingStatement } = await generateInterviewPlan(
//             setup.cvFile, 
//             setup.cvText, 
//             setup.company, 
//             setup.role, 
//             setup.experienceLevel,
//             INDIAN_MALE_NAMES,
//             INDIAN_FEMALE_NAMES,
//             language
//         );
        
//         const newSession: InterviewSession = {
//             ...setup,
//             rounds,
//             currentRoundIndex: 0,
//         };
//         debug('INTERVIEW', 'Interview plan received', { newSession, openingStatement });
//         setInterviewSession(newSession);
        
//         const initialMessage: ChatMessage = { sender: 'ai', text: openingStatement, isSpoken: true };
//         setConversationHistory([initialMessage]);
        
//         triggerTransition("Interview Starting", 2000);

//         setTimeout(() => {
//             const firstInterviewerGender = newSession.rounds[0]?.interviewerGender || 'male';
//             speak(openingStatement, () => {
//                 setTutorState(TutorState.AWAITING_TASK); // Ready for user's first response
//             }, firstInterviewerGender);
//         }, 1000);

//     } catch (err) {
//         debug('ERROR', 'Failed to start interview', { error: err });
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//         setTutorState(TutorState.ERROR);
//     } finally {
//         setIsLoading(false);
//     }
// }, [speak, language]);

//     const handleBuildLibraryCourse = useCallback(async (topic: string) => {
//         debug('LIBRARY', 'Building library course for topic', { topic });
//         setIsLoading(true);
//         setError(null);
//         setAppMode('LIBRARY');
//         setTutorState(TutorState.LOADING_LESSON);
//         setLibraryCourse(null);
//         setCurrentLibraryTopicId(null);
        
//         try {
//             const course = await generateLibraryCourse(topic, language);
//             debug('LIBRARY', 'Library course received', { course });
//             setLibraryCourse(course);
//             if (course.topics.length > 0) {
//                 setCurrentLibraryTopicId(course.topics[0].id);
//             }
//             setTutorState(TutorState.IDLE);
//         } catch (err) {
//             debug('ERROR', 'Failed to build library course', { error: err });
//             setError(err instanceof Error ? err.message : 'An unknown error occurred');
//             setTutorState(TutorState.ERROR);
//         } finally {
//             setIsLoading(false);
//         }

//     }, [language]);


//   const handleSelectSkill = (skillId: string) => {
//     debug('EVENT', 'Skill selected', { skillId });
//     const skill = currentUser?.skills.find(s => s.id === skillId);
//     if (!skill) return;

//     setError(null);
//     setLesson(null);
//     setCurrentSkillId(skillId);
//     setCurrentTopicId(skill.topics[0]?.id || null);
//     setConversationHistory([]);
//     setWhiteboardDisplayCode('// Click "Start Learning" or select a topic to begin.');
//     setTutorState(TutorState.SELECTING_SKILL);
//     setVisualAid(null);
//     setIsVisualAidLoading(false);
//     setAppMode('TUTOR');
//   };

//   const addSkillToUser = (user: UserProfile, newSkill: Skill): UserProfile => {
//     return { ...user, skills: [...user.skills, newSkill] };
//   };

//   const handleCreateSkill = async (outline: CourseOutline, forUserId: string) => {
//     debug('EVENT', 'Creating new skill for user', { outline, forUserId });
//     const forUser = users.find(u => u.id === forUserId);
//     if (!forUser) return;

//     const newSkill: Skill = {
//       id: `skill-${Date.now()}`,
//       name: outline.skillName,
//       icon: BookOpenIcon,
//       topics: outline.topics.map((topic, index) => ({
//         id: `topic-${Date.now()}-${index}`,
//         title: topic.title,
//         description: topic.description,
//         isCompleted: false,
//         points: topic.points || 100,
//       })),
//       creatorId: forUser.id,
//       creatorName: forUser.name,
//       createdAt: new Date().toISOString(),
//       hubRatings: [],
//       hubUsers: [forUser.id],
//       isSharedToHub: false, // Courses are private by default
//     };
    
//     setUsers(prevUsers => prevUsers.map(u => u.id === forUserId ? addSkillToUser(u, newSkill) : u));
//     debug('DATA', 'User profile updated with new skill', { userId: forUserId, newSkillId: newSkill.id });

//     // If the skill was created for the current user, select it immediately
//     if (forUserId === currentUserId) {
//         setError(null);
//         setLesson(null);
//         setCurrentSkillId(newSkill.id);
//         setCurrentTopicId(newSkill.topics[0]?.id || null);
//         setConversationHistory([]);
//         setWhiteboardDisplayCode('// Click "Start Learning" or select a topic to begin.');
//         setTutorState(TutorState.SELECTING_SKILL);
//         setVisualAid(null);
//         setIsVisualAidLoading(false);
//         setAppMode('TUTOR');
//     }
//   };

//   const handleCreateQuest = (skillName: string) => {
//     if (!currentUser) return;

//     const botFriend = currentUser.friends.find(f => f.isBot);
//     if (!botFriend) {
//       debug('WARN', 'No bot friend found to assign quest to.');
//       return;
//     }

//     const newQuest: Quest = {
//       id: `quest-${Date.now()}`,
//       fromUserId: currentUser.id,
//       fromUserName: currentUser.name,
//       toUserId: botFriend.id,
//       skillName,
//       status: 'PENDING',
//       createdAt: new Date().toISOString(),
//     };

//     const updatedUser = { ...currentUser, quests: [...currentUser.quests, newQuest] };
//     setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
//     debug('QUEST', 'New quest created', { newQuest });
//   };
  
//   // This simulates the bot friend completing the quest
//   useEffect(() => {
//     const processBotQuests = async () => {
//         const questBot = users.find(u => u.friends.some(f => f.id === 'sparky-bot'));
//         if (!questBot) return;

//         const pendingQuests = users.flatMap(u => u.quests).filter(q => q.toUserId === 'sparky-bot' && q.status === 'PENDING');
        
//         if (pendingQuests.length > 0) {
//             const questToProcess = pendingQuests[0];
//             const requestingUser = users.find(u => u.id === questToProcess.fromUserId);
//             if (!requestingUser) return;
            
//             debug('QUEST', 'Bot is processing a quest', { quest: questToProcess });

//             try {
//                 // Bot generates the course outline
//                 const outline = await generateCourseOutline(questToProcess.skillName, 10, 'Beginner', language);
                
//                 // Bot creates the skill and adds it to the requesting user's profile
//                 const newSkill: Skill = {
//                     id: `skill-${Date.now()}`,
//                     name: outline.skillName,
//                     icon: BookOpenIcon,
//                     topics: outline.topics.map((topic, index) => ({
//                         id: `topic-${Date.now()}-${index}`,
//                         title: topic.title,
//                         description: topic.description,
//                         isCompleted: false,
//                         points: topic.points || 100,
//                     })),
//                     creatorId: 'sparky-bot',
//                     creatorName: 'Sparky',
//                     createdAt: new Date().toISOString(),
//                     hubRatings: [],
//                     hubUsers: [requestingUser.id],
//                     isSharedToHub: true, // Bot courses are public by default
//                 };
                
//                 // Update users state
//                 setUsers(prevUsers => {
//                     return prevUsers.map(user => {
//                         // Add skill to the requesting user
//                         let updatedUser = user.id === questToProcess.fromUserId ? { ...user, skills: [...user.skills, newSkill] } : user;
                        
//                         // Update the quest status for all users who might have it
//                         const questIndex = updatedUser.quests.findIndex(q => q.id === questToProcess.id);
//                         if (questIndex > -1) {
//                             const updatedQuests = [...updatedUser.quests];
//                             updatedQuests[questIndex] = {
//                                 ...updatedQuests[questIndex],
//                                 status: 'COMPLETED',
//                                 completedAt: new Date().toISOString()
//                             };
//                             updatedUser = { ...updatedUser, quests: updatedQuests };
//                         }
                        
//                         return updatedUser;
//                     });
//                 });
//                 debug('QUEST', 'Bot completed quest, skill added', { questId: questToProcess.id, skillName: newSkill.name, userId: questToProcess.fromUserId });

//             } catch (err) {
//                 console.error("Bot failed to process quest:", err);
//                 // Optionally, update quest to 'REJECTED' or 'FAILED'
//             }
//         }
//     };

//     const intervalId = setInterval(processBotQuests, 15000); // Check every 15 seconds
//     return () => clearInterval(intervalId);

//   }, [users, setUsers, language]);


//   const handleSelectTopic = useCallback((topicId: string) => {
//       debug('EVENT', 'Topic selected', { topicId });
//       if (topicId === currentTopicId && lesson) {
//           debug('INFO', 'Topic already loaded, ignoring selection.');
//           return;
//       }
      
//       const skill = currentUser?.skills.find(s => s.id === currentSkillId);
//       const topicIndex = skill?.topics.findIndex(t => t.id === topicId);
      
//       if (skill && topicIndex !== undefined && topicIndex > 0 && !skill.topics[topicIndex - 1].isCompleted) {
//           debug('WARN', 'Attempted to select a locked topic.', { topicId });
//           return; 
//       }
      
//       cancel();
//       setCurrentTopicId(topicId);
//       setLesson(null); 
//       setTutorState(TutorState.LOADING_LESSON); 
//   }, [currentTopicId, lesson, currentUser, currentSkillId, cancel]);

//   const handleStartLearning = () => {
//     if (currentTopicId) {
//         debug('EVENT', 'Start learning button clicked');
//         setTutorState(TutorState.LOADING_LESSON);
//     }
//   };

//   const handleNextLesson = () => {
//     debug('EVENT', 'Next lesson button clicked');
//     const currentIdx = currentSkill?.topics.findIndex(t => t.id === currentTopicId);
//     if (currentSkill && currentIdx !== undefined && currentIdx < currentSkill.topics.length - 1) {
//         const nextTopic = currentSkill.topics[currentIdx + 1];
//         if (nextTopic) {
//             handleSelectTopic(nextTopic.id);
//         }
//     }
//   };

//   const handleTryAgain = () => {
//     debug('EVENT', 'Try again button clicked');
//     if(currentStep?.type === 'MULTIPLE_CHOICE') {
//       setTutorState(TutorState.AWAITING_CHOICE);
//       speak(t('tutor.feedbackTryAgainMCQ'), undefined, language);
//     } else {
//       setTutorState(TutorState.AWAITING_TASK);
//       speak(t('tutor.feedbackTryAgainTask'), undefined, language);
//     }
//   };

//   const handleContinueLesson = useCallback(() => {
//     debug('EVENT', 'Continue lesson button clicked', { stateToRestore: TutorState[stateBeforeDoubt] });
//     setClarificationCode(null);
//     setTutorState(stateBeforeDoubt);

//     const text = t('tutor.getBackToIt');
//     speak(text, undefined, language);
//     setConversationHistory(prev => [...prev, { sender: 'ai', text, isSpoken: true }]);
//   }, [speak, stateBeforeDoubt, setConversationHistory, setClarificationCode, setTutorState, t, language]);

//   const handleLogout = () => {
//     debug('AUTH', 'User logging out');
//     handleReset();
//     setCurrentUserId(null);
//   };

//   const handleExitInterviewSetup = () => {
//     debug('EVENT', 'Exiting interview setup');
//     setAppMode('SELECTION');
//   };

//   const handleSignUp = (name: string, pin: string): string | undefined => {
//     debug('AUTH', 'Attempting sign up', { name });
//     if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
//         debug('AUTH', 'Sign up failed: username taken');
//         return t('auth.errorUserTaken');
//     }
//     const newUser: UserProfile = {
//         id: `user-${Date.now()}`,
//         name,
//         password: pin,
//         points: 0,
//         currentStreak: 0,
//         longestStreak: 0,
//         lastActivityDate: null,
//         activityLog: [],
//         badges: [],
//         skills: [],
//         preferredAnimationLibrary: 'p5js',
//         friends: [{ id: 'sparky-bot', name: 'Sparky', isBot: true }],
//         quests: [],
//     };
//     setUsers([...users, newUser]);
//     setCurrentUserId(newUser.id);
//     debug('AUTH', 'Sign up successful', { userId: newUser.id });
//     return undefined;
//   };
  
//   const handleLogin = (name: string, pin: string): string | undefined => {
//     debug('AUTH', 'Attempting login', { name });
//     const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
//     if (!user) {
//         debug('AUTH', 'Login failed: user not found');
//         return t('auth.errorUserNotFound');
//     }
//     if (user.password !== pin) {
//         debug('AUTH', 'Login failed: incorrect PIN');
//         return t('auth.errorIncorrectPin');
//     }
//     setCurrentUserId(user.id);
//     debug('AUTH', 'Login successful', { userId: user.id });
//     return undefined;
//   };

//   const handlePromptDeleteSkill = (skillId: string) => {
//     debug('EVENT', 'Prompting for skill deletion', { skillId });
//     setDeleteModal({ isOpen: true, skillId, error: '', isLoading: false });
//   };

//   const handleConfirmDeleteSkill = (pin: string) => {
//     if (!deleteModal.skillId || !currentUser || deleteModal.isLoading) return;

//     if (pin !== currentUser.password) {
//         setDeleteModal(prev => ({ ...prev, error: t('auth.errorIncorrectPin') }));
//         debug('EVENT', 'Skill deletion failed: incorrect PIN');
//         return;
//     }
    
//     debug('EVENT', 'Confirmed skill deletion', { skillId: deleteModal.skillId });
//     setDeleteModal(prev => ({ ...prev, isLoading: true, error: '' }));

//     // Simulate async operation for visual feedback
//     setTimeout(() => {
//         const updatedSkills = currentUser.skills.filter(s => s.id !== deleteModal.skillId);
//         const updatedUser = { ...currentUser, skills: updatedSkills };
//         setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

//         if (currentSkillId === deleteModal.skillId) {
//             handleReset();
//         }
//         setDeleteModal({ isOpen: false, skillId: null, error: '', isLoading: false });
//         debug('EVENT', 'Skill deleted successfully');
//     }, 500);
//   };
  
//    const handleRateSkill = (skillName: string, rating: number) => {
//     if (!currentUser) return;
//     debug('HUB', 'Rating skill', { skillName, rating, userId: currentUser.id });
//     setUsers(prevUsers => {
//       return prevUsers.map(user => {
//         const updatedSkills = user.skills.map(skill => {
//           if (skill.name === skillName) {
//             const existingRatingIndex = skill.hubRatings.findIndex(r => r.userId === currentUser.id);
//             let updatedRatings;
//             if (existingRatingIndex > -1) {
//               updatedRatings = skill.hubRatings.map((r, i) => i === existingRatingIndex ? { ...r, rating } : r);
//             } else {
//               updatedRatings = [...skill.hubRatings, { userId: currentUser.id, rating }];
//             }
//             return { ...skill, hubRatings: updatedRatings };
//           }
//           return skill;
//         });
//         return { ...user, skills: updatedSkills };
//       });
//     });
//   };

//   const handleAddSkillFromHub = (skillToAdd: Skill) => {
//     if (!currentUser) return;
//     debug('HUB', 'Adding skill from Hub', { skillName: skillToAdd.name, userId: currentUser.id });
//     // Add the skill to the current user's profile
//     const newSkillForUser: Skill = {
//       ...skillToAdd,
//       id: `skill-${Date.now()}`, // Give it a new unique ID for this user
//       topics: skillToAdd.topics.map(topic => ({ ...topic, isCompleted: false })), // Reset progress
//     };

//     setUsers(prevUsers => {
//       // Update the hubUsers count on all instances of this skill
//       const updatedUsers = prevUsers.map(user => {
//         const updatedSkills = user.skills.map(skill => {
//           if (skill.name === skillToAdd.name) {
//             // Add current user to hubUsers if not already there
//             const newHubUsers = skill.hubUsers.includes(currentUser.id) ? skill.hubUsers : [...skill.hubUsers, currentUser.id];
//             return { ...skill, hubUsers: newHubUsers };
//           }
//           return skill;
//         });
//         return { ...user, skills: updatedSkills };
//       });

//       // Add the skill to the current user
//       return updatedUsers.map(user => {
//         if (user.id === currentUser.id) {
//           return { ...user, skills: [...user.skills, newSkillForUser] };
//         }
//         return user;
//       });
//     });
    
//     // Automatically select the newly added skill
//     handleSelectSkill(newSkillForUser.id);
//   };
  
//   const handleShareSkillToHub = (skillId: string) => {
//     if (!currentUser) return;
//     debug('HUB', 'Sharing skill to Hub', { skillId });
    
//     setUsers(prevUsers => {
//       return prevUsers.map(user => {
//         // Find the current user
//         if (user.id === currentUser.id) {
//           const updatedSkills = user.skills.map(skill => {
//             if (skill.id === skillId) {
//               return { ...skill, isSharedToHub: true };
//             }
//             return skill;
//           });
//           return { ...user, skills: updatedSkills };
//         }
//         return user;
//       });
//     });
//   };

//   const handleUpdateProfile = (updatedProfileData: Partial<UserProfile>) => {
//     if (!currentUser) return;
//     const updatedUser = { ...currentUser, ...updatedProfileData };
//     setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
//     debug('DATA', 'User profile updated with new settings', { updatedProfileData });
//   };

//   useEffect(() => {
//     debug('LIFECYCLE', 'App mounted', { currentUserId, users });
//     const user = users.find(u => u.id === currentUserId);
//     if (user) {
//         debug('AUTH', 'User session validated', { userId: user.id, name: user.name });
//     } else if (currentUserId) {
//         debug('AUTH', 'Stale user session found, logging out.');
//         setCurrentUserId(null);
//     }
//   }, []); // Run only on mount

//   useEffect(() => {
//     debug('STATE_CHANGE', `Tutor state changed to ${TutorState[tutorState]}`, {
//         isLoading,
//         appMode,
//         currentStep: currentStep?.type,
//         currentStepIndex,
//         conversationLength: conversationHistory.length,
//     });
//   }, [tutorState, isLoading, appMode, currentStep, currentStepIndex, conversationHistory.length]);
  
//   if (!currentUser) {
//     return (
//       <AuthScreen
//         onLogin={handleLogin}
//         onSignUp={handleSignUp}
//       />
//     );
//   }

//   if (viewingCertificate) {
//     return (
//       <Certificate 
//         studentName={currentUser.name}
//         courseName={viewingCertificate.courseName}
//         dateAwarded={viewingCertificate.dateAwarded}
//         onClose={() => setViewingCertificate(null)}
//       />
//     );
//   }
  
//   if (tutorState === TutorState.COURSE_COMPLETED && appMode !== 'INTERVIEW_PREP') {
//     return (
//       <CourseCompletionScreen 
//         courseName={currentSkill?.name || 'Selected Skill'}
//         onBackToDashboard={handleReset}
//       />
//     );
//   }
  
//   if (appMode === 'SELECTION') {
//     return (
//       <SkillSelectionScreen
//         userProfile={currentUser}
//         allUsers={users}
//         onSelectSkill={handleSelectSkill}
//         onDeleteSkill={handlePromptDeleteSkill}
//         onCreateSkill={(outline) => handleCreateSkill(outline, currentUser.id)}
//         onCreateQuest={handleCreateQuest}
//         onSetMode={setAppMode}
//         onViewCertificate={(badge) => setViewingCertificate(badge)}
//         onLogout={handleLogout}
//         onAddSkillFromHub={handleAddSkillFromHub}
//         onRateSkill={handleRateSkill}
//         onShareSkillToHub={handleShareSkillToHub}
//         onUpdateProfile={handleUpdateProfile}
//       />
//     );
//   }
  
//   if (appMode === 'INTERVIEW_PREP' && !interviewSession) {
//     return <InterviewSetupScreen onStartInterview={handleStartInterview} isLoading={isLoading} onExit={() => setAppMode('SELECTION')} />;
//   }

//   if (appMode === 'LIBRARY' && !libraryCourse) {
//       return <LibrarySetupScreen onBuildCourse={handleBuildLibraryCourse} isLoading={isLoading} onExit={() => setAppMode('SELECTION')} error={error} />;
//   }
  
//   const showStartLearningButton = (appMode === 'TUTOR' && !lesson && tutorState !== TutorState.LOADING_LESSON && !!currentTopicId);

//   return (
//     <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
//         <DeleteConfirmationModal
//             isOpen={deleteModal.isOpen}
//             onClose={() => setDeleteModal({ isOpen: false, skillId: null, error: '', isLoading: false })}
//             onConfirm={handleConfirmDeleteSkill}
//             courseName={currentUser.skills.find(s => s.id === deleteModal.skillId)?.name || ''}
//             isLoading={deleteModal.isLoading}
//             error={deleteModal.error}
//         />
//         <TransitionCurtain isVisible={isTransitioning} text={transitionText} />

//         <aside className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:w-20' : 'md:w-80 lg:w-96'}`}>
//             <div className="w-full h-full bg-gray-800/50 md:border-r border-gray-700">
//                 {isSidebarCollapsed ? (
//                     <div className="h-full flex flex-col items-center justify-start pt-6 gap-4">
//                         {appMode === 'TUTOR' && <div title={currentSkill?.name || 'Tutor Mode'}><BookOpenIcon className="w-8 h-8 text-purple-400" /></div>}
//                         {(appMode === 'DOUBT_SOLVER') && <div title="Doubt Solver"><LightBulbIcon className="w-8 h-8 text-teal-400" /></div>}
//                         {appMode === 'INTERVIEW_PREP' && <div title="Interview Prep"><BriefcaseIcon className="w-8 h-8 text-blue-400" /></div>}
//                         {appMode === 'LIBRARY' && <div title={libraryCourse?.courseName || 'Library'}><LibraryIcon className="w-8 h-8 text-green-400" /></div>}
//                     </div>
//                 ) : (
//                     <>
//                         {appMode === 'TUTOR' && (
//                             <ProgressTracker 
//                                 currentSkill={currentSkill} 
//                                 onReset={handleReset}
//                                 onSelectTopic={handleSelectTopic}
//                                 currentTopicId={currentTopicId}
//                                 userProfile={currentUser}
//                             />
//                         )}
//                         {appMode === 'DOUBT_SOLVER' && !solution && (
//                             <DoubtHeader onReset={handleReset} />
//                         )}
//                         {appMode === 'DOUBT_SOLVER' && solution && (
//                             <ProgressTracker 
//                                 currentSkill={{
//                                   id: 'doubt-skill',
//                                   name: `Doubt: ${solution.language}`,
//                                   icon: BookOpenIcon,
//                                   topics: [{
//                                     id: 'doubt-topic',
//                                     title: 'Problem Explanation',
//                                     description: problem,
//                                     isCompleted: false,
//                                     points: 0
//                                   }],
//                                   creatorId: '',
//                                   creatorName: '',
//                                   createdAt: '',
//                                   hubRatings: [],
//                                   hubUsers: [],
//                                   isSharedToHub: false,
//                                 }}
//                                 onReset={handleReset}
//                                 onSelectTopic={() => {}}
//                                 currentTopicId={'doubt-topic'}
//                                 userProfile={currentUser}
//                             />
//                         )}
//                         {appMode === 'INTERVIEW_PREP' && interviewSession && (
//                             <InterviewRoundsTracker session={interviewSession} onReset={handleReset} />
//                         )}
//                         {appMode === 'LIBRARY' && libraryCourse && (
//                             <LibraryProgressTracker course={libraryCourse} onReset={handleReset} onSelectTopic={setCurrentLibraryTopicId} currentTopicId={currentLibraryTopicId} />
//                         )}
//                     </>
//                 )}
//             </div>
//             <button
//                 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//                 className="absolute top-6 right-0 translate-x-1/2 z-20 bg-gray-700 p-1.5 rounded-full text-white hover:bg-purple-500 transition-colors hidden md:block"
//                 aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//             >
//                 {isSidebarCollapsed ? <ChevronRightIcon className="w-5 h-5"/> : <ChevronLeftIcon className="w-5 h-5"/>}
//             </button>
//         </aside>

//       <main className="flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6 min-h-0">
//         <div className="flex-1 flex flex-col min-w-0">
          
//            {appMode === 'DOUBT_SOLVER' && !solution ? (
//               <DoubtInputPanel onSolve={handleSolveDoubt} isLoading={isLoading} />
//            ) : appMode === 'LIBRARY' ? (
//               <LibraryContentPanel topic={currentLibraryTopic} allSources={libraryCourse?.allSources || []} />
//            ) : (
//               <div className="flex-1 min-h-0">
//                 <TutorPanel
//                     appMode={appMode}
//                     tutorState={tutorState}
//                     isLoading={isLoading || isVisualAidLoading || (isSpeechSupported && isListening && interimTranscript === '')}
//                     conversationHistory={conversationHistory}
//                     error={error}
//                     chatError={chatError}
//                     onRetryChat={handleRetryChat}
//                     isMuted={isMuted}
//                     onToggleMute={toggleMute}
//                     onStartLearning={handleStartLearning}
//                     onSendMessage={handleSendChatMessage}
//                     onNextLesson={handleNextLesson}
//                     onNextStep={handleNextStep}
//                     onAnswerMcq={handleAnswerMcq}
//                     onTryAgain={handleTryAgain}
//                     onContinueLesson={handleContinueLesson}
//                     onRequestHint={handleRequestHint}
//                     onShowSolution={handleShowSolution}
//                     incorrectAttempts={incorrectAttempts}
//                     currentTopicTitle={appMode === 'TUTOR' ? currentTopic?.title : (appMode === 'INTERVIEW_PREP' ? currentInterviewRound?.title : libraryCourse?.courseName)}
//                     currentStep={currentStep}
//                     isListening={isListening}
//                     interimTranscript={interimTranscript}
//                     isSpeechSupported={isSpeechSupported}
//                     isSpeaking={isSpeaking}
//                     spokenText={spokenText}
//                     mouthShape={mouthShape}
//                     showStartLearningButton={showStartLearningButton}
//                 />
//               </div>
//            )}
//         </div>
//         <div className="flex-1 flex flex-col gap-6 min-w-0">
//             {(appMode !== 'DOUBT_SOLVER' || solution) && appMode !== 'LIBRARY' && (
//               <TaskPanel mission={currentStep?.type === 'CODE_TASK' ? currentStep.mission : solution?.problemExplanation} currentStep={currentStep} title={solution ? t('misc.problemStatement') : t('misc.mission')} />
//             )}
//             <div className="flex-1 min-h-0">
//                 <Whiteboard
//                     isEditable={tutorState === TutorState.AWAITING_TASK || tutorState === TutorState.INCORRECT}
//                     showSubmitButton={
//                         tutorState === TutorState.AWAITING_TASK ||
//                         tutorState === TutorState.EVALUATING ||
//                         tutorState === TutorState.INCORRECT
//                     }
//                     displayCode={clarificationCode ?? whiteboardDisplayCode}
//                     userCode={userCode}
//                     onCodeChange={setUserCode}
//                     onSubmitCode={handleSubmitCode}
//                     isLoading={isLoading && tutorState === TutorState.EVALUATING}
//                     visualAid={visualAid}
//                     isVisualAidLoading={isVisualAidLoading}
//                     language={codeLanguage}
//                     isMuted={isMuted}
//                 />
//             </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TutorState, Skill, Lesson, Topic, ChatMessage, AppMode, ProblemSolution, CourseOutline, VisualAid, LessonStep, Hint, UserProfile, Badge, SpeechSegment, InterviewSession, InterviewRound, StepCodeTask, ExperienceLevel, InterviewerGender, Quest, LibraryCourse, LibraryTopic, CourseComplexity } from './types';
import { generateLessonContent, evaluateCode, generateCourseOutline, generateChatResponse, generateProblemSolution, generateBadgeTitle, generateInterviewPlan, generateInterviewFollowUp, generateLibraryCourse, generateVisualAid } from './services/geminiServices';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLanguage } from './hooks/useLanguage';
import { useTranslations } from './hooks/useTranslations';
import { bcp47LanguageMap } from './translations';

import { TutorPanel } from './components/TutorPanel';
import { Whiteboard } from './components/Whiteboard';
import { SkillSelectionScreen } from './components/SkillSelectionScreen';
import { ProgressTracker } from './components/ProgressTracker';
import { Certificate } from './components/Certificate';
import { CourseCompletionScreen } from './components/CourseCompletionScreen';
import { TaskPanel } from './components/TaskPanel';
import { DoubtInputPanel } from './components/DoubtInputPanel';
import { DoubtHeader } from './components/DoubtHeader';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { AuthScreen } from './components/AuthScreen';
import { InterviewSetupScreen } from './components/InterviewSetupScreen';
import { InterviewRoundsTracker } from './components/InterviewRoundsTracker';
import { TransitionCurtain } from './components/TransitionCurtain';
import { LibrarySetupScreen } from './components/LibrarySetupScreen';
import { LibraryProgressTracker } from './components/LibraryProgressTracker';
import { LibraryContentPanel } from './components/LibraryContentPanel';
import { debug } from './utils/debug';
import type { Language } from './translations';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from './components/icons/ChevronRightIcon';
import { LightBulbIcon } from './components/icons/LightBulbIcon';
import { BriefcaseIcon } from './components/icons/BriefcaseIcon';
import { LibraryIcon } from './components/icons/LibraryIcon';
import { dbService } from './services/dbService';

const INDIAN_MALE_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Vivaan', 'Arjun', 'Reyansh', 'Shaurya', 'Rohan', 'Advik', 'Kabir', 'Ishaan', 'Sai', 'Dhruv', 'Aryan', 'Krish'];
const INDIAN_FEMALE_NAMES = ['Aanya', 'Diya', 'Saanvi', 'Myra', 'Anika', 'Aarohi', 'Isha', 'Pari', 'Riya', 'Kiara', 'Ananya', 'Tara', 'Navya', 'Zara', 'Siya'];


// Date helpers for streak calculation
const isYesterday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
};

const isToday = (dateString: string): boolean => {
    return new Date(dateString).toDateString() === new Date().toDateString();
}

export default function App(): React.ReactNode {
  const [users, setUsers] = useLocalStorage<UserProfile[]>('tutor-users', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('tutor-currentUserId', null);
  
  const { language } = useLanguage();
  const { t } = useTranslations();

  // Effect for handling language direction (RTL/LTR)
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.lang = language;
    }
  }, [language]);

  const [appMode, setAppMode] = useState<AppMode>('SELECTION');
  const [tutorState, setTutorState] = useState<TutorState>(TutorState.IDLE);
  
  // Tutor Mode State
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  
  // Doubt Solver Mode State
  const [problem, setProblem] = useState<string>('');
  const [solution, setSolution] = useState<ProblemSolution | null>(null);

  // Interview Prep Mode State
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');

  // Library Mode State
  const [libraryCourse, setLibraryCourse] = useState<LibraryCourse | null>(null);
  const [currentLibraryTopicId, setCurrentLibraryTopicId] = useState<string | null>(null);

  // Shared State
  const [userCode, setUserCode] = useState<string>('');
  const [whiteboardDisplayCode, setWhiteboardDisplayCode] = useState<string>('// Select a mode to get started!');
  const [visualAid, setVisualAid] = useState<VisualAid | null>(null);
  const [isVisualAidLoading, setIsVisualAidLoading] = useState<boolean>(false);
  const [clarificationCode, setClarificationCode] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<{ message: string; attachment?: File | null } | null>(null);
  const [stateBeforeDoubt, setStateBeforeDoubt] = useState<TutorState>(TutorState.AWAITING_TASK);
  const [viewingCertificate, setViewingCertificate] = useState<Badge | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, skillId: null as string | null, error: '', isLoading: false });

  const { speak, cancel, isMuted, toggleMute, isSpeaking, spokenText, mouthShape } = useSpeechSynthesis(language);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  const currentSkill = useMemo(() => currentUser?.skills.find(s => s.id === currentSkillId), [currentUser, currentSkillId]);
  const currentTopic = useMemo(() => currentSkill?.topics.find(t => t.id === currentTopicId), [currentSkill, currentTopicId]);
  const currentStep = useMemo(() => lesson?.steps[currentStepIndex], [lesson, currentStepIndex]);
  const currentInterviewRound = useMemo(() => interviewSession?.rounds[interviewSession.currentRoundIndex], [interviewSession]);
  const currentLibraryTopic = useMemo(() => libraryCourse?.topics.find(t => t.id === currentLibraryTopicId), [libraryCourse, currentLibraryTopicId]);

  const codeLanguage = useMemo(() => {
    if (appMode === 'DOUBT_SOLVER' && solution?.language) {
      return solution.language.toLowerCase();
    }
    if (appMode === 'INTERVIEW_PREP') {
      return 'javascript'; // Default for interviews, could be adapted
    }
    if (appMode === 'TUTOR' && currentSkill?.name) {
      const name = currentSkill.name.toLowerCase();
      if (name.includes('python')) return 'python';
      if (name.includes('javascript') || name.includes('js')) return 'javascript';
      if (name.includes('html')) return 'html';
      if (name.includes('css')) return 'css';
      return 'javascript';
    }
    return 'javascript';
  }, [appMode, solution, currentSkill]);

  const triggerTransition = (text: string, duration = 2000) => {
    setTransitionText(text);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), duration);
  };
  
  // =================================================================================
  // CORE CALLBACKS - ORDERED TO PREVENT HOISTING ISSUES
  // =================================================================================
  const handleReset = useCallback(() => {
    debug('EVENT', 'Resetting app to selection screen');
    cancel();
    setAppMode('SELECTION');
    setCurrentSkillId(null);
    setCurrentTopicId(null);
    setLesson(null);
    setUserCode('');
    setConversationHistory([]);
    setProblem('');
    setSolution(null);
    setVisualAid(null);
    setIsVisualAidLoading(false);
    setCurrentStepIndex(0);
    setIncorrectAttempts(0);
    setCurrentHint(null);
    setInterviewSession(null);
    setLibraryCourse(null);
    setCurrentLibraryTopicId(null);
    setTutorState(TutorState.IDLE);
    setError(null);
    setChatError(null);
    setWhiteboardDisplayCode('// Select a mode to get started!')
  }, [cancel]);

  const handleAnswerMcq = useCallback((choiceIndex: number, isInputFromChat: boolean = false) => {
    if (currentStep?.type !== 'MULTIPLE_CHOICE') return;

    debug('EVENT', 'MCQ answer submitted', { choiceIndex, correctAnswer: currentStep.correctChoiceIndex, isInputFromChat });
    if (!isInputFromChat) {
      setConversationHistory(prev => [...prev, { sender: 'user', text: `Selected: "${currentStep.choices[choiceIndex]}"` }]);
    }
    
    // eslint-disable-next-line eqeqeq
    if (choiceIndex == currentStep.correctChoiceIndex) {
        debug('STATE', 'MCQ answer correct');
        const feedback = currentStep.feedback || t('tutor.feedbackCorrect');
        speak(feedback, () => setTutorState(TutorState.AWAITING_CONTINUE), language);
    } else {
        debug('STATE', 'MCQ answer incorrect');
        const feedback = t('tutor.feedbackIncorrect');
        speak(feedback, undefined, language);
        setTutorState(TutorState.INCORRECT);
    }
  }, [currentStep, speak, setConversationHistory, setTutorState, t, language]);
  
  // Ref to break circular dependency between handleNextInterviewRound and handleSendChatMessage
  const handleNextInterviewRoundRef = useRef<() => void>(() => {});

  const handleSendChatMessage = useCallback(async (message: string, attachment?: File | null, isSystemMessage: boolean = false) => {
    if (!message.trim() && !attachment) return;

    debug('CHAT', 'handleSendChatMessage triggered', { message, hasAttachment: !!attachment, isSystemMessage, currentState: TutorState[tutorState], appMode });

    if (!isSystemMessage) {
      const userMessage: ChatMessage = { sender: 'user', text: message };
      setConversationHistory(prev => [...prev, userMessage]);
    }

    if (appMode === 'TUTOR' && tutorState === TutorState.AWAITING_CHOICE && currentStep?.type === 'MULTIPLE_CHOICE' && !isSystemMessage) {
        const choices = currentStep.choices.map(c => c.toLowerCase());
        const cleanedUserChoice = message.toLowerCase().replace(/[.,?]/g, '').trim();
        const matchedIndex = choices.findIndex(c => c.includes(cleanedUserChoice));

        if (matchedIndex > -1) {
            debug('CHAT', 'MCQ answer detected via speech/text, handling as answer.', { choice: choices[matchedIndex], spoken: cleanedUserChoice });
            handleAnswerMcq(matchedIndex, true);
            return;
        }
        debug('CHAT', 'Speech received during MCQ, but did not match choices. Treating as a doubt.');
    }
    
    // If the user interrupts while the AI is explaining, we want to return to the state *after* the explanation is done.
    const stateToSave = tutorState === TutorState.EXPLAINING ? TutorState.AWAITING_CONTINUE : tutorState;
    debug('STATE', `Saving state before entering doubt clarification: ${TutorState[stateToSave]}`);
    setStateBeforeDoubt(stateToSave);

    setTutorState(TutorState.CHATTING);
    setChatError(null);
    setLastFailedMessage(null);

    try {
      let aiResponse;
      let responseSpeechGender: InterviewerGender | Language = language;
      const currentHistory: ChatMessage[] = isSystemMessage 
        ? [...conversationHistory, { sender: 'user', text: message, isSystem: true }] 
        : conversationHistory;

      if (appMode === 'INTERVIEW_PREP') {
        if (!interviewSession || !currentInterviewRound) throw new Error("Interview session not initialized.");
        debug('API', 'Generating interview follow-up');
        responseSpeechGender = currentInterviewRound.interviewerGender;
        aiResponse = await generateInterviewFollowUp(interviewSession, currentHistory, userCode, message, language);
        
        if (aiResponse.isRoundFinished) {
          // The AI's response will be spoken, and then the round will transition.
          const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse.responseText, code: aiResponse.updatedCode, visualAid: aiResponse.visualAid, isSpoken: true };
          debug('CHAT', 'AI response received (round finished)', { aiResponse });
          setConversationHistory(prev => [...prev, aiMessage]);
          speak(aiResponse.responseText, () => handleNextInterviewRoundRef.current(), responseSpeechGender);
          return; // Prevent state from being set below, as handleNext... will take over
        }
      } else {
        const contextLesson = appMode === 'TUTOR' 
            ? lesson 
            : solution 
            ? { task: problem, code: solution.solutionCode } 
            : null;
        
        const contextSkillName = appMode === 'TUTOR' 
            ? currentSkill?.name 
            : solution?.language;

        if (!contextLesson || !contextSkillName || !currentUser) throw new Error("Chat context not available.");

        debug('API', 'Generating standard chat response');
        aiResponse = await generateChatResponse(contextSkillName, contextLesson, currentHistory, message, userCode, appMode, language, currentUser.preferredAnimationLibrary, attachment ?? undefined);
      }
      
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse.responseText, code: aiResponse.updatedCode, visualAid: aiResponse.visualAid, isSpoken: true };
      
      debug('CHAT', 'AI response received', { aiResponse });
      setConversationHistory(prev => [...prev, aiMessage]);
      speak(aiResponse.responseText, undefined, responseSpeechGender);
      
      if (aiResponse.updatedCode) {
        setUserCode(aiResponse.updatedCode);
        if (appMode === 'TUTOR') {
          setClarificationCode(aiResponse.updatedCode);
        } else {
          setWhiteboardDisplayCode(aiResponse.updatedCode);
        }
      }

      if (aiResponse.visualAid) {
        setVisualAid(aiResponse.visualAid);
      }
      
      const nextState = appMode === 'TUTOR' ? TutorState.CLARIFYING_DOUBT : TutorState.AWAITING_TASK;
      debug('STATE', `Transitioning to ${TutorState[nextState]} to await user continuation.`);
      setTutorState(nextState);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      debug('ERROR', 'Chat failed, restoring state', { error: err, stateToRestore: TutorState[stateBeforeDoubt] });
      setChatError(errorMsg);
      setLastFailedMessage({ message, attachment });
      setTutorState(stateBeforeDoubt); // Restore state on error
    }
  }, [conversationHistory, lesson, speak, stateBeforeDoubt, tutorState, userCode, currentSkill, appMode, solution, problem, currentStep, handleAnswerMcq, interviewSession, currentInterviewRound, language, currentUser]);

  const handleNextInterviewRound = useCallback(() => {
    if (!interviewSession) return;
    const nextRoundIndex = interviewSession.currentRoundIndex + 1;
    if (nextRoundIndex < interviewSession.rounds.length) {
      triggerTransition(`Next Round: ${interviewSession.rounds[nextRoundIndex].title}`);
      
      // Artificial delay to allow curtain to drop before new content appears
      setTimeout(() => {
        setInterviewSession(prev => prev ? ({
          ...prev,
          rounds: prev.rounds.map((r, i) => i === prev.currentRoundIndex ? {...r, completed: true} : r),
          currentRoundIndex: nextRoundIndex
        }) : null);
        
        // This system message will trigger the AI to introduce themselves for the new round.
        handleSendChatMessage(`Okay, I'm ready for the next round.`, undefined, true);
      }, 1000);
    } else {
      // Interview finished
      triggerTransition("Interview Complete!", 3000);
      const endMessage = `Great job, ${currentUser?.name}! That concludes our interview. You did very well. I'll reset the session now. Feel free to start another one whenever you're ready.`;
      const lastInterviewerGender = interviewSession.rounds[interviewSession.rounds.length - 1].interviewerGender;
      speak(endMessage, handleReset, lastInterviewerGender);
      setConversationHistory(prev => [...prev, { sender: 'ai', text: endMessage, isSpoken: true }]);
      setTutorState(TutorState.COURSE_COMPLETED); // Reuse this state for the end screen
    }
  }, [interviewSession, currentUser, speak, handleReset, handleSendChatMessage]);

  useEffect(() => {
    handleNextInterviewRoundRef.current = handleNextInterviewRound;
  }, [handleNextInterviewRound]);

  const fetchVisualAidForStep = useCallback(async (step: LessonStep) => {
    if (step.type !== 'EXPLANATION' || !currentUser) return;
    debug('API', 'Fetching on-demand visual aid for explanation', { content: step.content });
    setIsVisualAidLoading(true);
    try {
        const newVisualAid = await generateVisualAid(step.content, language, currentUser.preferredAnimationLibrary);
        setVisualAid(newVisualAid);
    } catch (err) {
        debug('ERROR', 'Failed to fetch on-demand visual aid', { error: err });
    } finally {
        setIsVisualAidLoading(false);
    }
  }, [language, currentUser]);

  const processStep = useCallback((step: LessonStep) => {
    if (!step) return;
    debug('STATE', `Processing step ${currentStepIndex + 1}/${lesson?.steps.length}: ${step.type}`, { step });

    setVisualAid(null);
    setIsVisualAidLoading(false);

    let textToSpeak: string | null = null;
    let segmentsToSpeak: SpeechSegment[] | null = null;
    let nextState: TutorState | null = null;
    let postSpeechState: TutorState | null = null;
    let aiMessage: ChatMessage | null = null;

    switch(step.type) {
      case 'EXPLANATION':
        textToSpeak = step.content;
        nextState = TutorState.EXPLAINING;
        postSpeechState = TutorState.AWAITING_CONTINUE;
        aiMessage = { sender: 'ai', text: textToSpeak, isSpoken: true };
        fetchVisualAidForStep(step);
        break;
      case 'MULTIPLE_CHOICE':
        textToSpeak = step.question;
        nextState = TutorState.AWAITING_CHOICE;
        aiMessage = { sender: 'ai', text: textToSpeak, choices: step.choices, correctChoiceIndex: step.correctChoiceIndex, isSpoken: true };
        break;
      case 'CODE_TASK':
        textToSpeak = step.mission;
        if (step.visualAid) {
            setVisualAid(step.visualAid);
        }
        nextState = TutorState.AWAITING_TASK;
        aiMessage = { sender: 'ai', text: textToSpeak, visualAid: step.visualAid, isSpoken: true };
        break;
    }
    
    if (nextState) setTutorState(nextState);
    if (aiMessage) setConversationHistory(prev => [...prev, aiMessage]);

    const onEnd = () => {
        if (postSpeechState) {
            setTutorState(postSpeechState);
        }
    };
    
    if (segmentsToSpeak) {
        speak(segmentsToSpeak, onEnd);
    } else if (textToSpeak) {
        speak(textToSpeak, onEnd, language);
    }
  }, [speak, setConversationHistory, setTutorState, currentStepIndex, lesson, language, fetchVisualAidForStep]);
  
  const fetchLesson = useCallback(async () => {
    if (!currentTopic || !currentSkill || !currentUser) {
      if (currentSkill && currentSkill.topics.every(t => t.isCompleted)) {
        debug('STATE', 'All topics for the skill are completed.', { skillId: currentSkill.id });
        setTutorState(TutorState.COURSE_COMPLETED);
      }
      return;
    }
    
    debug('API', 'Fetching lesson content', { skill: currentSkill.name, topic: currentTopic.title });
    setIsLoading(true);
    setError(null);
    setTutorState(TutorState.LOADING_LESSON);
    try {
      const lessonContent = await generateLessonContent(currentSkill.name, currentTopic.title, currentTopic.id, language, currentUser.preferredAnimationLibrary);
      debug('API', 'Lesson content fetched successfully', { lessonContent });
      setLesson(lessonContent);
      setCurrentStepIndex(0);
      setIncorrectAttempts(0);
      setCurrentHint(null);

      const codeTask = lessonContent.steps.find(s => s.type === 'CODE_TASK');
      const initialCode = codeTask?.type === 'CODE_TASK' ? (codeTask as StepCodeTask).startingCode : '// Your code will appear here';
      setUserCode(initialCode);
      setWhiteboardDisplayCode(initialCode);

      setClarificationCode(null);
      setConversationHistory([]);
      setVisualAid(null);
      setIsVisualAidLoading(false);
      
      if (lessonContent.steps && lessonContent.steps.length > 0) {
        processStep(lessonContent.steps[0]);
      } else {
        console.warn("Lesson has no valid steps. Proceeding to next lesson.");
        debug('WARN', 'Lesson has no valid steps. Auto-completing.', { topicId: currentTopic.id });
        setTutorState(TutorState.CORRECT);
      }
      
    } catch (err) {
      debug('ERROR', 'Failed to fetch lesson', { error: err });
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTutorState(TutorState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [currentTopic, currentSkill, setLesson, setUserCode, setConversationHistory, setCurrentStepIndex, processStep, setIncorrectAttempts, setCurrentHint, language, currentUser]);

  useEffect(() => {
    if (currentTopicId && tutorState === TutorState.LOADING_LESSON) {
        debug('EFFECT', 'Triggering fetchLesson due to state change', { currentTopicId, tutorState: TutorState[tutorState] });
        fetchLesson();
    }
  }, [currentTopicId, tutorState, fetchLesson]);

  const handleNextStep = useCallback(async () => {
    cancel();
    debug('EVENT', 'handleNextStep triggered', { currentStepIndex, totalSteps: lesson?.steps.length });

    if (!lesson || !currentUser || !currentSkill) return;

    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex < lesson.steps.length) {
      debug('STATE', 'Moving to next step', { nextStepIndex });
      setCurrentStepIndex(nextStepIndex);
      processStep(lesson.steps[nextStepIndex]);
    } else {
      debug('STATE', 'Lesson completed. Updating progress.');
      const pointsEarned = currentTopic?.points || 100;
      const today = new Date().toISOString().split('T')[0];
      
      let newStreak = currentUser.currentStreak;
      if (!currentUser.lastActivityDate || !isToday(currentUser.lastActivityDate)) {
        if (currentUser.lastActivityDate && isYesterday(currentUser.lastActivityDate)) {
          newStreak++;
        } else {
          newStreak = 1;
        }
      }

      const newLongestStreak = Math.max(currentUser.longestStreak || 0, newStreak);
      
      const activityLog = currentUser.activityLog || [];
      const todayLogIndex = activityLog.findIndex(log => log.date === today);
      let newActivityLog;

      if (todayLogIndex > -1) {
          newActivityLog = activityLog.map((log, index) => 
              index === todayLogIndex ? { ...log, points: log.points + pointsEarned } : log
          );
      } else {
          newActivityLog = [...activityLog, { date: today, points: pointsEarned }];
      }
      
      const updatedSkills = currentUser.skills.map(skill => 
        skill.id === currentSkillId ? {
          ...skill,
          topics: skill.topics.map(topic => 
            topic.id === currentTopic?.id ? { ...topic, isCompleted: true } : topic
          )
        } : skill
      );
      
      let updatedUser = {
        ...currentUser,
        skills: updatedSkills,
        points: currentUser.points + pointsEarned,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        activityLog: newActivityLog,
        lastActivityDate: today,
      };

      const completedSkill = updatedSkills.find(s => s.id === currentSkillId);
      const allTopicsCompleted = completedSkill?.topics.every(t => t.isCompleted);
      
      if (allTopicsCompleted && completedSkill) {
          debug('STATE', 'Course completed', { skillName: completedSkill.name });
          const hasBadge = updatedUser.badges.some(b => b.courseName === completedSkill.name);
          if (!hasBadge) {
              const badgeTitle = await generateBadgeTitle(completedSkill.name, completedSkill.topics);
              const newBadge: Badge = {
                id: `badge-${completedSkill.id}-${Date.now()}`,
                courseName: completedSkill.name,
                title: badgeTitle,
                dateAwarded: new Date().toISOString(),
              };
              updatedUser = { ...updatedUser, badges: [...updatedUser.badges, newBadge] };
              debug('GAMIFICATION', 'New badge awarded', { newBadge });
          }
          
          const congratsSegments: SpeechSegment[] = [
              { text: t('completion.congratulations'), lang: language },
              { text: `You've completed the ${completedSkill.name} course! You can view your certificate on the dashboard.`, lang: 'en' },
          ];

          setTutorState(TutorState.COURSE_COMPLETED);
          speak(congratsSegments);
      } else {
        setTutorState(TutorState.CORRECT);
      }

      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      debug('DATA', 'User profile updated', { updatedUser });
      setUsers(updatedUsers);
    }
  }, [lesson, currentStepIndex, currentSkillId, currentTopic, cancel, processStep, speak, currentUser, users, setUsers, currentSkill, t, language]);

  const handleRetryChat = () => {
    if (lastFailedMessage) {
        debug('CHAT', 'Retrying last failed chat message', { lastFailedMessage });
        let userMessageIndex = -1;
        for (let i = conversationHistory.length - 1; i >= 0; i--) {
            if (conversationHistory[i].sender === 'user') {
                userMessageIndex = i;
                break;
            }
        }
        
        if (userMessageIndex !== -1) {
            setConversationHistory(prev => prev.slice(0, userMessageIndex));
        }
        const { message, attachment } = lastFailedMessage;
        setLastFailedMessage(null);
        setChatError(null);
        handleSendChatMessage(message, attachment);
    }
  }

  const isCodeTask = (appMode === 'TUTOR' && currentStep?.type === 'CODE_TASK') ||
                     (appMode === 'INTERVIEW_PREP' && currentInterviewRound?.type === 'CODING_CHALLENGE') ||
                     (appMode === 'INTERVIEW_PREP' && currentInterviewRound?.type === 'SYSTEM_DESIGN');

  const handleSubmitCode = useCallback(async () => {
    if ((appMode !== 'TUTOR' && appMode !== 'INTERVIEW_PREP') || (appMode === 'TUTOR' && (!currentSkill || currentStep?.type !== 'CODE_TASK'))) return;

    debug('EVENT', 'Code submission triggered', { code: userCode, appMode });
    setIsLoading(true);
    setError(null);
    setTutorState(TutorState.EVALUATING);
    try {
       // In interview mode, code submission is just another form of chat message
       if (appMode === 'INTERVIEW_PREP') {
          await handleSendChatMessage(`(I've written my code solution on the whiteboard. Here it is:\n\n${userCode}\n\nPlease evaluate it and provide feedback on time/space complexity, and suggest optimizations.)`);
          setIsLoading(false);
          // handleSendChatMessage sets the tutorState
          return;
       }

      // Existing tutor mode logic
      if (currentStep && currentStep.type === 'CODE_TASK' && currentSkill) {
        const { isCorrect, feedback, hint } = await evaluateCode(currentSkill.name, currentStep.mission, userCode, incorrectAttempts, language);
        debug('API', 'Code evaluation received', { isCorrect, feedback, hint });
        setConversationHistory(prev => [...prev, { sender: 'user', text: '(Submitting code for evaluation)'}, { sender: 'ai', text: feedback, isSpoken: true }]);
        
        if (isCorrect) {
          setIncorrectAttempts(0);
          setCurrentHint(null);
          setTutorState(TutorState.AWAITING_CONTINUE);
          speak(feedback, () => {
            setTutorState(TutorState.AWAITING_CONTINUE)
          }, language);
        } else {
          setIncorrectAttempts(prev => prev + 1);
          setCurrentHint(hint || null);
          speak(feedback, undefined, language);
          setTutorState(TutorState.INCORRECT);
        }
      }
    } catch (err) {
      debug('ERROR', 'Code evaluation failed', { error: err });
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTutorState(TutorState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [appMode, currentStep, userCode, currentSkill, speak, setConversationHistory, incorrectAttempts, setIncorrectAttempts, setCurrentHint, handleSendChatMessage, language]);

  const handleRequestHint = () => {
    if (!currentHint) return;
    debug('EVENT', 'Hint requested', { attemptNumber: incorrectAttempts, hint: currentHint });
    
    let hintText = '';
    if (incorrectAttempts === 1) {
        hintText = `Hint: ${currentHint.conceptual}`;
    } else if (incorrectAttempts >= 2) {
        hintText = `Okay, here's a more direct hint: ${currentHint.direct}`;
    }

    if (hintText) {
        speak(hintText, undefined, language);
        setConversationHistory(prev => [...prev, { sender: 'ai', text: hintText, isSpoken: true }]);
    }
  };

  const handleShowSolution = () => {
      if (!currentHint?.solution) return;
      debug('EVENT', 'Solution requested');
      setUserCode(currentHint.solution);
      setWhiteboardDisplayCode(currentHint.solution);
      const text = t('tutor.solutionHint');
      speak(text, () => {
          setTutorState(TutorState.AWAITING_CONTINUE);
      }, language);
      setConversationHistory(prev => [...prev, { sender: 'ai', text, isSpoken: true }]);
  };

  const {
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
    error: speechError,
  } = useSpeechRecognition({ 
      onTranscriptEnd: (msg) => handleSendChatMessage(msg),
      onSubmissionIntent: handleSubmitCode,
      isCodingContext: isCodeTask,
      lang: bcp47LanguageMap[language],
  });

  useEffect(() => {
    const isAwaitingUserInput = (tutorState === TutorState.AWAITING_TASK || tutorState === TutorState.INCORRECT || tutorState === TutorState.AWAITING_CHOICE);
    const canListen = isAwaitingUserInput && !isLoading && !isSpeaking && isSpeechSupported;

    if (canListen && !isListening) {
      debug('SPEECH', 'Conditions met, starting listening...');
      startListening();
    } else if (!canListen && isListening) {
      debug('SPEECH', 'Conditions no longer met, stopping listening...', { tutorState: TutorState[tutorState], isLoading, isSpeaking });
      stopListening();
    }
    return () => {
        if (isListening) stopListening();
    };
  }, [tutorState, isLoading, isSpeechSupported, startListening, stopListening, isSpeaking, isListening]);

  const handleSolveDoubt = useCallback(async (problemStatement: string, file?: File) => {
    const problemText = problemStatement || `Problem from uploaded file: ${file?.name}`;
    debug('EVENT', 'Solving doubt', { problem: problemText });
    setProblem(problemText);
    setIsLoading(true);
    setError(null);
    setTutorState(TutorState.LOADING_LESSON);
    setConversationHistory([]);
    setSolution(null);
    setVisualAid(null);
    setIsVisualAidLoading(false);
    try {
      const solutionContent = await generateProblemSolution(problemStatement, language, file);
      debug('API', 'Doubt solution received', { solutionContent });
      setSolution(solutionContent);
      setWhiteboardDisplayCode(solutionContent.solutionCode);
      setUserCode(solutionContent.solutionCode);
      setClarificationCode(null);
      
      const initialMessages: ChatMessage[] = [
        { sender: 'ai', text: solutionContent.problemExplanation, isSpoken: true },
        { sender: 'ai', text: solutionContent.solutionExplanation, isSpoken: true },
      ];
      setConversationHistory(initialMessages);

      speak(solutionContent.problemExplanation, () => {
        speak(solutionContent.solutionExplanation, () => {
             const followUp = t('tutor.askQuestion');
             speak(followUp.split('(')[0], undefined, language);
        }, language);
      }, language);
      
      setTutorState(TutorState.AWAITING_TASK);
    } catch (err) {
      debug('ERROR', 'Doubt solving failed', { error: err });
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setConversationHistory([{ sender: 'ai', text: err instanceof Error ? err.message : 'An unknown error occurred'}]);
      setTutorState(TutorState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [speak, setProblem, setConversationHistory, setSolution, setUserCode, language, t]);

  const handleStartInterview = useCallback(async (setup: { cvFile?: File, cvText?: string, company: string, role: string, experienceLevel: ExperienceLevel }) => {
    debug('INTERVIEW', 'Starting interview', { setup });
    setIsLoading(true);
    setError(null);
    setTutorState(TutorState.LOADING_LESSON);
    setConversationHistory([]);
    setInterviewSession(null);
    setVisualAid(null);
    setIsVisualAidLoading(false);
    setWhiteboardDisplayCode(`// Welcome to your interview for the ${setup.role} role at ${setup.company}.`);
    setUserCode('');

    try {
        const { rounds, openingStatement } = await generateInterviewPlan(
            setup.cvFile, 
            setup.cvText, 
            setup.company, 
            setup.role, 
            setup.experienceLevel,
            INDIAN_MALE_NAMES,
            INDIAN_FEMALE_NAMES,
            language
        );
        
        const newSession: InterviewSession = {
            ...setup,
            rounds,
            currentRoundIndex: 0,
        };
        debug('INTERVIEW', 'Interview plan received', { newSession, openingStatement });
        setInterviewSession(newSession);
        
        const initialMessage: ChatMessage = { sender: 'ai', text: openingStatement, isSpoken: true };
        setConversationHistory([initialMessage]);
        
        triggerTransition("Interview Starting", 2000);

        setTimeout(() => {
            const firstInterviewerGender = newSession.rounds[0]?.interviewerGender || 'male';
            speak(openingStatement, () => {
                setTutorState(TutorState.AWAITING_TASK); // Ready for user's first response
            }, firstInterviewerGender);
        }, 1000);

    } catch (err) {
        debug('ERROR', 'Failed to start interview', { error: err });
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setTutorState(TutorState.ERROR);
    } finally {
        setIsLoading(false);
    }
}, [speak, language]);

    const handleBuildLibraryCourse = useCallback(async (topic: string) => {
        debug('LIBRARY', 'Building library course for topic', { topic });
        setIsLoading(true);
        setError(null);
        setAppMode('LIBRARY');
        setTutorState(TutorState.LOADING_LESSON);
        setLibraryCourse(null);
        setCurrentLibraryTopicId(null);
        
        try {
            const course = await generateLibraryCourse(topic, language);
            debug('LIBRARY', 'Library course received', { course });
            setLibraryCourse(course);
            if (course.topics.length > 0) {
                setCurrentLibraryTopicId(course.topics[0].id);
            }
            setTutorState(TutorState.IDLE);
        } catch (err) {
            debug('ERROR', 'Failed to build library course', { error: err });
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setTutorState(TutorState.ERROR);
        } finally {
            setIsLoading(false);
        }

    }, [language]);


  const handleSelectSkill = (skillId: string) => {
    debug('EVENT', 'Skill selected', { skillId });
    const skill = currentUser?.skills.find(s => s.id === skillId);
    if (!skill) return;

    setError(null);
    setLesson(null);
    setCurrentSkillId(skillId);
    setCurrentTopicId(skill.topics[0]?.id || null);
    setConversationHistory([]);
    setWhiteboardDisplayCode('// Click "Start Learning" or select a topic to begin.');
    setTutorState(TutorState.SELECTING_SKILL);
    setVisualAid(null);
    setIsVisualAidLoading(false);
    setAppMode('TUTOR');
  };

  const addSkillToUser = (user: UserProfile, newSkill: Skill): UserProfile => {
    return { ...user, skills: [...user.skills, newSkill] };
  };

  const handleCreateSkill = async (outline: CourseOutline, forUserId: string) => {
    debug('EVENT', 'Creating new skill for user', { outline, forUserId });
    const forUser = users.find(u => u.id === forUserId);
    if (!forUser) return;

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: outline.skillName,
      icon: BookOpenIcon,
      topics: outline.topics.map((topic, index) => ({
        id: `topic-${Date.now()}-${index}`,
        title: topic.title,
        description: topic.description,
        isCompleted: false,
        points: topic.points || 100,
      })),
      creatorId: forUser.id,
      creatorName: forUser.name,
      createdAt: new Date().toISOString(),
      hubRatings: [],
      hubUsers: [forUser.id],
      isSharedToHub: false, // Courses are private by default
    };
    
    setUsers(prevUsers => prevUsers.map(u => u.id === forUserId ? addSkillToUser(u, newSkill) : u));
    debug('DATA', 'User profile updated with new skill', { userId: forUserId, newSkillId: newSkill.id });

    // If the skill was created for the current user, select it immediately
    if (forUserId === currentUserId) {
        setError(null);
        setLesson(null);
        setCurrentSkillId(newSkill.id);
        setCurrentTopicId(newSkill.topics[0]?.id || null);
        setConversationHistory([]);
        setWhiteboardDisplayCode('// Click "Start Learning" or select a topic to begin.');
        setTutorState(TutorState.SELECTING_SKILL);
        setVisualAid(null);
        setIsVisualAidLoading(false);
        setAppMode('TUTOR');
    }
  };

  const handleCreateQuest = (skillName: string) => {
    if (!currentUser) return;

    const botFriend = currentUser.friends.find(f => f.isBot);
    if (!botFriend) {
      debug('WARN', 'No bot friend found to assign quest to.');
      return;
    }

    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: botFriend.id,
      skillName,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const updatedUser = { ...currentUser, quests: [...currentUser.quests, newQuest] };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    debug('QUEST', 'New quest created', { newQuest });
  };
  
  // This simulates the bot friend completing the quest
  useEffect(() => {
    const processBotQuests = async () => {
        const questBot = users.find(u => u.friends.some(f => f.id === 'sparky-bot'));
        if (!questBot) return;

        const pendingQuests = users.flatMap(u => u.quests).filter(q => q.toUserId === 'sparky-bot' && q.status === 'PENDING');
        
        if (pendingQuests.length > 0) {
            const questToProcess = pendingQuests[0];
            const requestingUser = users.find(u => u.id === questToProcess.fromUserId);
            if (!requestingUser) return;
            
            debug('QUEST', 'Bot is processing a quest', { quest: questToProcess });

            try {
                // Bot generates the course outline
                const outline = await generateCourseOutline(questToProcess.skillName, 10, 'Beginner', language);
                
                // Bot creates the skill and adds it to the requesting user's profile
                const newSkill: Skill = {
                    id: `skill-${Date.now()}`,
                    name: outline.skillName,
                    icon: BookOpenIcon,
                    topics: outline.topics.map((topic, index) => ({
                        id: `topic-${Date.now()}-${index}`,
                        title: topic.title,
                        description: topic.description,
                        isCompleted: false,
                        points: topic.points || 100,
                    })),
                    creatorId: 'sparky-bot',
                    creatorName: 'Sparky',
                    createdAt: new Date().toISOString(),
                    hubRatings: [],
                    hubUsers: [requestingUser.id],
                    isSharedToHub: true, // Bot courses are public by default
                };
                
                // Update users state
                setUsers(prevUsers => {
                    return prevUsers.map(user => {
                        // Add skill to the requesting user
                        let updatedUser = user.id === questToProcess.fromUserId ? { ...user, skills: [...user.skills, newSkill] } : user;
                        
                        // Update the quest status for all users who might have it
                        const questIndex = updatedUser.quests.findIndex(q => q.id === questToProcess.id);
                        if (questIndex > -1) {
                            const updatedQuests = [...updatedUser.quests];
                            updatedQuests[questIndex] = {
                                ...updatedQuests[questIndex],
                                status: 'COMPLETED',
                                completedAt: new Date().toISOString()
                            };
                            updatedUser = { ...updatedUser, quests: updatedQuests };
                        }
                        
                        return updatedUser;
                    });
                });
                debug('QUEST', 'Bot completed quest, skill added', { questId: questToProcess.id, skillName: newSkill.name, userId: questToProcess.fromUserId });

            } catch (err) {
                console.error("Bot failed to process quest:", err);
                // Optionally, update quest to 'REJECTED' or 'FAILED'
            }
        }
    };

    const intervalId = setInterval(processBotQuests, 15000); // Check every 15 seconds
    return () => clearInterval(intervalId);

  }, [users, setUsers, language]);


  const handleSelectTopic = useCallback((topicId: string) => {
      debug('EVENT', 'Topic selected', { topicId });
      if (topicId === currentTopicId && lesson) {
          debug('INFO', 'Topic already loaded, ignoring selection.');
          return;
      }
      
      const skill = currentUser?.skills.find(s => s.id === currentSkillId);
      const topicIndex = skill?.topics.findIndex(t => t.id === topicId);
      
      if (skill && topicIndex !== undefined && topicIndex > 0 && !skill.topics[topicIndex - 1].isCompleted) {
          debug('WARN', 'Attempted to select a locked topic.', { topicId });
          return; 
      }
      
      cancel();
      setCurrentTopicId(topicId);
      setLesson(null); 
      setTutorState(TutorState.LOADING_LESSON); 
  }, [currentTopicId, lesson, currentUser, currentSkillId, cancel]);

  const handleStartLearning = () => {
    if (currentTopicId) {
        debug('EVENT', 'Start learning button clicked');
        setTutorState(TutorState.LOADING_LESSON);
    }
  };

  const handleNextLesson = () => {
    debug('EVENT', 'Next lesson button clicked');
    const currentIdx = currentSkill?.topics.findIndex(t => t.id === currentTopicId);
    if (currentSkill && currentIdx !== undefined && currentIdx < currentSkill.topics.length - 1) {
        const nextTopic = currentSkill.topics[currentIdx + 1];
        if (nextTopic) {
            handleSelectTopic(nextTopic.id);
        }
    }
  };

  const handleTryAgain = () => {
    debug('EVENT', 'Try again button clicked');
    if(currentStep?.type === 'MULTIPLE_CHOICE') {
      setTutorState(TutorState.AWAITING_CHOICE);
      speak(t('tutor.feedbackTryAgainMCQ'), undefined, language);
    } else {
      setTutorState(TutorState.AWAITING_TASK);
      speak(t('tutor.feedbackTryAgainTask'), undefined, language);
    }
  };

  const handleContinueLesson = useCallback(() => {
    debug('EVENT', 'Continue lesson button clicked', { stateToRestore: TutorState[stateBeforeDoubt] });
    setClarificationCode(null);
    setTutorState(stateBeforeDoubt);

    const text = t('tutor.getBackToIt');
    speak(text, undefined, language);
    setConversationHistory(prev => [...prev, { sender: 'ai', text, isSpoken: true }]);
  }, [speak, stateBeforeDoubt, setConversationHistory, setClarificationCode, setTutorState, t, language]);

    const handleUpdateVisualAid = async (newCode: string) => {
        if (!visualAid) return;

        // 1. Optimistically update state for immediate UI feedback
        const updatedVisualAid: VisualAid = { ...visualAid, content: newCode };
        setVisualAid(updatedVisualAid);

        // 2. Persist the change
        try {
            // Case 1: Standalone visual aid created by generateVisualAid
            if (updatedVisualAid.id && updatedVisualAid.id.startsWith('visualaid-')) {
                await dbService.set('visualAids', { ...updatedVisualAid, id: updatedVisualAid.id });
                debug('CACHE', 'Updated standalone visual aid in cache', { id: updatedVisualAid.id });
            } 
            // Case 2: Visual aid is part of a lesson step
            else if (appMode === 'TUTOR' && lesson && currentStep && ('visualAid' in currentStep)) {
                const updatedLesson = {
                    ...lesson,
                    steps: lesson.steps.map((step, index) => 
                        index === currentStepIndex ? { ...step, visualAid: updatedVisualAid } : step
                    )
                };
                setLesson(updatedLesson); // Also update lesson in state
                if (currentTopicId) {
                    await dbService.set('lessons', { ...updatedLesson, id: currentTopicId });
                    debug('CACHE', 'Updated visual aid within lesson cache', { topicId: currentTopicId });
                }
            }
            // Case 3: Visual aid came from a chat message (ephemeral update)
            else {
                const lastAiMessageWithVA = [...conversationHistory].reverse().find(m => m.sender === 'ai' && m.visualAid);
                if (lastAiMessageWithVA) {
                    const updatedHistory = conversationHistory.map(m => 
                        m === lastAiMessageWithVA ? { ...m, visualAid: updatedVisualAid } : m
                    );
                    setConversationHistory(updatedHistory);
                    debug('STATE', 'Updated visual aid within conversation history (ephemeral).');
                }
            }
        } catch (error) {
            debug('ERROR', 'Failed to save updated visual aid', { error });
        }
    };

  const handleLogout = () => {
    debug('AUTH', 'User logging out');
    handleReset();
    setCurrentUserId(null);
  };

  const handleExitInterviewSetup = () => {
    debug('EVENT', 'Exiting interview setup');
    setAppMode('SELECTION');
  };

  const handleSignUp = (name: string, pin: string): string | undefined => {
    debug('AUTH', 'Attempting sign up', { name });
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
        debug('AUTH', 'Sign up failed: username taken');
        return t('auth.errorUserTaken');
    }
    const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        password: pin,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        activityLog: [],
        badges: [],
        skills: [],
        preferredAnimationLibrary: 'p5js',
        friends: [{ id: 'sparky-bot', name: 'Sparky', isBot: true }],
        quests: [],
    };
    setUsers([...users, newUser]);
    setCurrentUserId(newUser.id);
    debug('AUTH', 'Sign up successful', { userId: newUser.id });
    return undefined;
  };
  
  const handleLogin = (name: string, pin: string): string | undefined => {
    debug('AUTH', 'Attempting login', { name });
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) {
        debug('AUTH', 'Login failed: user not found');
        return t('auth.errorUserNotFound');
    }
    if (user.password !== pin) {
        debug('AUTH', 'Login failed: incorrect PIN');
        return t('auth.errorIncorrectPin');
    }
    setCurrentUserId(user.id);
    debug('AUTH', 'Login successful', { userId: user.id });
    return undefined;
  };

  const handlePromptDeleteSkill = (skillId: string) => {
    debug('EVENT', 'Prompting for skill deletion', { skillId });
    setDeleteModal({ isOpen: true, skillId, error: '', isLoading: false });
  };

  const handleConfirmDeleteSkill = (pin: string) => {
    if (!deleteModal.skillId || !currentUser || deleteModal.isLoading) return;

    if (pin !== currentUser.password) {
        setDeleteModal(prev => ({ ...prev, error: t('auth.errorIncorrectPin') }));
        debug('EVENT', 'Skill deletion failed: incorrect PIN');
        return;
    }
    
    debug('EVENT', 'Confirmed skill deletion', { skillId: deleteModal.skillId });
    setDeleteModal(prev => ({ ...prev, isLoading: true, error: '' }));

    // Simulate async operation for visual feedback
    setTimeout(() => {
        const updatedSkills = currentUser.skills.filter(s => s.id !== deleteModal.skillId);
        const updatedUser = { ...currentUser, skills: updatedSkills };
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

        if (currentSkillId === deleteModal.skillId) {
            handleReset();
        }
        setDeleteModal({ isOpen: false, skillId: null, error: '', isLoading: false });
        debug('EVENT', 'Skill deleted successfully');
    }, 500);
  };
  
   const handleRateSkill = (skillName: string, rating: number) => {
    if (!currentUser) return;
    debug('HUB', 'Rating skill', { skillName, rating, userId: currentUser.id });
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        const updatedSkills = user.skills.map(skill => {
          if (skill.name === skillName) {
            const existingRatingIndex = skill.hubRatings.findIndex(r => r.userId === currentUser.id);
            let updatedRatings;
            if (existingRatingIndex > -1) {
              updatedRatings = skill.hubRatings.map((r, i) => i === existingRatingIndex ? { ...r, rating } : r);
            } else {
              updatedRatings = [...skill.hubRatings, { userId: currentUser.id, rating }];
            }
            return { ...skill, hubRatings: updatedRatings };
          }
          return skill;
        });
        return { ...user, skills: updatedSkills };
      });
    });
  };

  const handleAddSkillFromHub = (skillToAdd: Skill) => {
    if (!currentUser) return;
    debug('HUB', 'Adding skill from Hub', { skillName: skillToAdd.name, userId: currentUser.id });
    // Add the skill to the current user's profile
    const newSkillForUser: Skill = {
      ...skillToAdd,
      id: `skill-${Date.now()}`, // Give it a new unique ID for this user
      topics: skillToAdd.topics.map(topic => ({ ...topic, isCompleted: false })), // Reset progress
    };

    setUsers(prevUsers => {
      // Update the hubUsers count on all instances of this skill
      const updatedUsers = prevUsers.map(user => {
        const updatedSkills = user.skills.map(skill => {
          if (skill.name === skillToAdd.name) {
            // Add current user to hubUsers if not already there
            const newHubUsers = skill.hubUsers.includes(currentUser.id) ? skill.hubUsers : [...skill.hubUsers, currentUser.id];
            return { ...skill, hubUsers: newHubUsers };
          }
          return skill;
        });
        return { ...user, skills: updatedSkills };
      });

      // Add the skill to the current user
      return updatedUsers.map(user => {
        if (user.id === currentUser.id) {
          return { ...user, skills: [...user.skills, newSkillForUser] };
        }
        return user;
      });
    });
    
    // Automatically select the newly added skill
    handleSelectSkill(newSkillForUser.id);
  };
  
  const handleShareSkillToHub = (skillId: string) => {
    if (!currentUser) return;
    debug('HUB', 'Sharing skill to Hub', { skillId });
    
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        // Find the current user
        if (user.id === currentUser.id) {
          const updatedSkills = user.skills.map(skill => {
            if (skill.id === skillId) {
              return { ...skill, isSharedToHub: true };
            }
            return skill;
          });
          return { ...user, skills: updatedSkills };
        }
        return user;
      });
    });
  };

  const handleUpdateProfile = (updatedProfileData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedProfileData };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    debug('DATA', 'User profile updated with new settings', { updatedProfileData });
  };

  useEffect(() => {
    debug('LIFECYCLE', 'App mounted', { currentUserId, users });
    const user = users.find(u => u.id === currentUserId);
    if (user) {
        debug('AUTH', 'User session validated', { userId: user.id, name: user.name });
    } else if (currentUserId) {
        debug('AUTH', 'Stale user session found, logging out.');
        setCurrentUserId(null);
    }
  }, []); // Run only on mount

  useEffect(() => {
    debug('STATE_CHANGE', `Tutor state changed to ${TutorState[tutorState]}`, {
        isLoading,
        appMode,
        currentStep: currentStep?.type,
        currentStepIndex,
        conversationLength: conversationHistory.length,
    });
  }, [tutorState, isLoading, appMode, currentStep, currentStepIndex, conversationHistory.length]);
  
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />
    );
  }

  if (viewingCertificate) {
    return (
      <Certificate 
        studentName={currentUser.name}
        courseName={viewingCertificate.courseName}
        dateAwarded={viewingCertificate.dateAwarded}
        onClose={() => setViewingCertificate(null)}
      />
    );
  }
  
  if (tutorState === TutorState.COURSE_COMPLETED && appMode !== 'INTERVIEW_PREP') {
    return (
      <CourseCompletionScreen 
        courseName={currentSkill?.name || 'Selected Skill'}
        onBackToDashboard={handleReset}
      />
    );
  }
  
  if (appMode === 'SELECTION') {
    return (
      <SkillSelectionScreen
        userProfile={currentUser}
        allUsers={users}
        onSelectSkill={handleSelectSkill}
        onDeleteSkill={handlePromptDeleteSkill}
        onCreateSkill={(outline) => handleCreateSkill(outline, currentUser.id)}
        onCreateQuest={handleCreateQuest}
        onSetMode={setAppMode}
        onViewCertificate={(badge) => setViewingCertificate(badge)}
        onLogout={handleLogout}
        onAddSkillFromHub={handleAddSkillFromHub}
        onRateSkill={handleRateSkill}
        onShareSkillToHub={handleShareSkillToHub}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }
  
  if (appMode === 'INTERVIEW_PREP' && !interviewSession) {
    return <InterviewSetupScreen onStartInterview={handleStartInterview} isLoading={isLoading} onExit={() => setAppMode('SELECTION')} />;
  }

  if (appMode === 'LIBRARY' && !libraryCourse) {
      return <LibrarySetupScreen onBuildCourse={handleBuildLibraryCourse} isLoading={isLoading} onExit={() => setAppMode('SELECTION')} error={error} />;
  }
  
  const showStartLearningButton = (appMode === 'TUTOR' && !lesson && tutorState !== TutorState.LOADING_LESSON && !!currentTopicId);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
        <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, skillId: null, error: '', isLoading: false })}
            onConfirm={handleConfirmDeleteSkill}
            courseName={currentUser.skills.find(s => s.id === deleteModal.skillId)?.name || ''}
            isLoading={deleteModal.isLoading}
            error={deleteModal.error}
        />
        <TransitionCurtain isVisible={isTransitioning} text={transitionText} />

        <aside className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:w-20' : 'md:w-80 lg:w-96'}`}>
            <div className="w-full h-full bg-gray-800/50 md:border-r border-gray-700">
                {isSidebarCollapsed ? (
                    <div className="h-full flex flex-col items-center justify-start pt-6 gap-4">
                        {appMode === 'TUTOR' && <div title={currentSkill?.name || 'Tutor Mode'}><BookOpenIcon className="w-8 h-8 text-purple-400" /></div>}
                        {(appMode === 'DOUBT_SOLVER') && <div title="Doubt Solver"><LightBulbIcon className="w-8 h-8 text-teal-400" /></div>}
                        {appMode === 'INTERVIEW_PREP' && <div title="Interview Prep"><BriefcaseIcon className="w-8 h-8 text-blue-400" /></div>}
                        {appMode === 'LIBRARY' && <div title={libraryCourse?.courseName || 'Library'}><LibraryIcon className="w-8 h-8 text-green-400" /></div>}
                    </div>
                ) : (
                    <>
                        {appMode === 'TUTOR' && (
                            <ProgressTracker 
                                currentSkill={currentSkill} 
                                onReset={handleReset}
                                onSelectTopic={handleSelectTopic}
                                currentTopicId={currentTopicId}
                                userProfile={currentUser}
                            />
                        )}
                        {appMode === 'DOUBT_SOLVER' && !solution && (
                            <DoubtHeader onReset={handleReset} />
                        )}
                        {appMode === 'DOUBT_SOLVER' && solution && (
                            <ProgressTracker 
                                currentSkill={{
                                  id: 'doubt-skill',
                                  name: `Doubt: ${solution.language}`,
                                  icon: BookOpenIcon,
                                  topics: [{
                                    id: 'doubt-topic',
                                    title: 'Problem Explanation',
                                    description: problem,
                                    isCompleted: false,
                                    points: 0
                                  }],
                                  creatorId: '',
                                  creatorName: '',
                                  createdAt: '',
                                  hubRatings: [],
                                  hubUsers: [],
                                  isSharedToHub: false,
                                }}
                                onReset={handleReset}
                                onSelectTopic={() => {}}
                                currentTopicId={'doubt-topic'}
                                userProfile={currentUser}
                            />
                        )}
                        {appMode === 'INTERVIEW_PREP' && interviewSession && (
                            <InterviewRoundsTracker session={interviewSession} onReset={handleReset} />
                        )}
                        {appMode === 'LIBRARY' && libraryCourse && (
                            <LibraryProgressTracker course={libraryCourse} onReset={handleReset} onSelectTopic={setCurrentLibraryTopicId} currentTopicId={currentLibraryTopicId} />
                        )}
                    </>
                )}
            </div>
            <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute top-6 right-0 translate-x-1/2 z-20 bg-gray-700 p-1.5 rounded-full text-white hover:bg-purple-500 transition-colors hidden md:block"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isSidebarCollapsed ? <ChevronRightIcon className="w-5 h-5"/> : <ChevronLeftIcon className="w-5 h-5"/>}
            </button>
        </aside>

      <main className="flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          
           {appMode === 'DOUBT_SOLVER' && !solution ? (
              <DoubtInputPanel onSolve={handleSolveDoubt} isLoading={isLoading} />
           ) : appMode === 'LIBRARY' ? (
              <LibraryContentPanel topic={currentLibraryTopic} allSources={libraryCourse?.allSources || []} />
           ) : (
              <div className="flex-1 min-h-0">
                <TutorPanel
                    appMode={appMode}
                    tutorState={tutorState}
                    isLoading={isLoading || isVisualAidLoading || (isSpeechSupported && isListening && interimTranscript === '')}
                    conversationHistory={conversationHistory}
                    error={error}
                    chatError={chatError}
                    onRetryChat={handleRetryChat}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    onStartLearning={handleStartLearning}
                    onSendMessage={handleSendChatMessage}
                    onNextLesson={handleNextLesson}
                    onNextStep={handleNextStep}
                    onAnswerMcq={handleAnswerMcq}
                    onTryAgain={handleTryAgain}
                    onContinueLesson={handleContinueLesson}
                    onRequestHint={handleRequestHint}
                    onShowSolution={handleShowSolution}
                    incorrectAttempts={incorrectAttempts}
                    currentTopicTitle={appMode === 'TUTOR' ? currentTopic?.title : (appMode === 'INTERVIEW_PREP' ? currentInterviewRound?.title : libraryCourse?.courseName)}
                    currentStep={currentStep}
                    isListening={isListening}
                    interimTranscript={interimTranscript}
                    isSpeechSupported={isSpeechSupported}
                    isSpeaking={isSpeaking}
                    spokenText={spokenText}
                    mouthShape={mouthShape}
                    showStartLearningButton={showStartLearningButton}
                />
              </div>
           )}
        </div>
        <div className="flex-1 flex flex-col gap-6 min-w-0">
            {(appMode !== 'DOUBT_SOLVER' || solution) && appMode !== 'LIBRARY' && (
              <TaskPanel mission={currentStep?.type === 'CODE_TASK' ? currentStep.mission : solution?.problemExplanation} currentStep={currentStep} title={solution ? t('misc.problemStatement') : t('misc.mission')} />
            )}
            <div className="flex-1 min-h-0">
                <Whiteboard
                    isEditable={tutorState === TutorState.AWAITING_TASK || tutorState === TutorState.INCORRECT}
                    showSubmitButton={
                        tutorState === TutorState.AWAITING_TASK ||
                        tutorState === TutorState.EVALUATING ||
                        tutorState === TutorState.INCORRECT
                    }
                    displayCode={clarificationCode ?? whiteboardDisplayCode}
                    userCode={userCode}
                    onCodeChange={setUserCode}
                    onSubmitCode={handleSubmitCode}
                    isLoading={isLoading && tutorState === TutorState.EVALUATING}
                    visualAid={visualAid}
                    isVisualAidLoading={isVisualAidLoading}
                    language={codeLanguage}
                    isMuted={isMuted}
                    onSaveVisualAidCode={handleUpdateVisualAid}
                />
            </div>
        </div>
      </main>
    </div>
  );
}