import { useState, useCallback, useEffect, useRef } from 'react';
import { debug } from '../utils/debug';
import { SpeechSegment, InterviewerGender } from '../types';
import type { Language } from '../translations';
import { bcp47LanguageMap } from '../translations';

const MOUTH_SHAPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const useSpeechSynthesis = (globalLanguage: Language) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [mouthShape, setMouthShape] = useState('X');

  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
  const onEndCallback = useRef<(() => void) | undefined>(undefined);
  const mouthShapeInterval = useRef<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      debug('SPEECH', 'Voices loaded', { count: availableVoices.length });
    };
    
    handleVoicesChanged(); // Initial check
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const processQueue = useCallback(() => {
    if (utteranceQueue.current.length > 0) {
      const utterance = utteranceQueue.current.shift();
      if (utterance) {
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsSpeaking(false);
      setMouthShape('X');
      if (mouthShapeInterval.current) {
        clearInterval(mouthShapeInterval.current);
        mouthShapeInterval.current = null;
      }
      if (onEndCallback.current) {
        onEndCallback.current();
        onEndCallback.current = undefined;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    utteranceQueue.current = [];
    onEndCallback.current = undefined;
    if (mouthShapeInterval.current) {
      clearInterval(mouthShapeInterval.current);
      mouthShapeInterval.current = null;
    }
    setIsSpeaking(false);
    setMouthShape('X');
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((textOrSegments: string | SpeechSegment[], onEnd?: () => void, langOrGender: Language | InterviewerGender = 'en') => {
    debug('SPEECH', 'speak() called with browser TTS', { textOrSegments, langOrGender, isMuted });

    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    cancel();

    let segments: SpeechSegment[];
    if (typeof textOrSegments === 'string') {
      const lang = Object.keys(bcp47LanguageMap).includes(langOrGender as Language) ? langOrGender as Language : globalLanguage;
      segments = [{ text: textOrSegments, lang }];
    } else {
      segments = textOrSegments;
    }
    
    segments = segments.filter(s => s.text && s.text.trim().length > 0);
    if (segments.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    const fullOriginalText = segments.map(s => s.text).join(' ');
    setSpokenText(fullOriginalText);
    setIsSpeaking(true);
    setMouthShape('A'); // Initial shape
    onEndCallback.current = onEnd;

    for (const segment of segments) {
      const utterance = new SpeechSynthesisUtterance(segment.text);
      
      const bcp47Lang = bcp47LanguageMap[segment.lang];
      utterance.lang = bcp47Lang;

      // Find best voice
      const isInterview = langOrGender === 'male' || langOrGender === 'female';
      const desiredGender = isInterview ? langOrGender : undefined;

      const voiceCandidates = voices.filter(v => v.lang.startsWith(bcp47Lang.split('-')[0]));
      let bestVoice: SpeechSynthesisVoice | undefined = voiceCandidates.find(v => v.lang === bcp47Lang);
      
      if (desiredGender) {
        const genderFiltered = voiceCandidates.filter(v => v.name.toLowerCase().includes(desiredGender));
        if (genderFiltered.length > 0) {
          bestVoice = genderFiltered.find(v => v.lang === bcp47Lang) || genderFiltered[0];
        }
      }
      
      if (bestVoice) {
        utterance.voice = bestVoice;
        debug('SPEECH', 'Voice selected', { voice: bestVoice.name, lang: bestVoice.lang });
      }

      utterance.onstart = () => {
        if (mouthShapeInterval.current) clearInterval(mouthShapeInterval.current);
        mouthShapeInterval.current = window.setInterval(() => {
          const randomShape = MOUTH_SHAPES[Math.floor(Math.random() * MOUTH_SHAPES.length)];
          setMouthShape(randomShape);
        }, 120);
      };

      utterance.onend = () => {
        processQueue();
      };
      
      utterance.onerror = (e) => {
        debug('ERROR', 'Speech synthesis error', e);
        processQueue(); // Skip to next item in queue
      };

      utteranceQueue.current.push(utterance);
    }
    
    // Start processing if not already speaking
    if (!window.speechSynthesis.speaking) {
      processQueue();
    }
  }, [isMuted, voices, cancel, processQueue, globalLanguage]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const nextState = !prev;
      if (nextState) {
        cancel();
      }
      return nextState;
    });
  }, [cancel]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { speak, cancel, isMuted, toggleMute, isSpeaking, spokenText, mouthShape };
};
