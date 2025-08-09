import React, { useState, useEffect } from 'react';
import { LibraryTopic, SourceLink } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { LinkIcon } from './icons/LinkIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { PresentationChartBarIcon } from './icons/PresentationChartBarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface LibraryContentPanelProps {
  topic: LibraryTopic | undefined;
  allSources: SourceLink[];
}

const TabButton: React.FC<{ icon: React.FC<any>, active: boolean, onClick: () => void, children: React.ReactNode, disabled?: boolean }> = ({ icon: Icon, active, onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors rounded-md ${active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'} disabled:text-gray-600 disabled:bg-gray-800/50 disabled:cursor-not-allowed`}
    >
        <Icon className="w-5 h-5" />
        {children}
    </button>
);

export const LibraryContentPanel: React.FC<LibraryContentPanelProps> = ({ topic, allSources }) => {
    const [activeTab, setActiveTab] = useState<'LESSON' | 'PPT' | 'SOURCES'>('LESSON');
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const { t } = useTranslations();
    
    const hasSlides = topic?.pptSlides && topic.pptSlides.length > 0;
    const currentSlide = hasSlides ? topic.pptSlides[currentSlideIndex] : null;

    useEffect(() => {
        setActiveTab('LESSON');
        setCurrentSlideIndex(0);
    }, [topic]);
    
    const handleNextSlide = () => {
        if (topic && currentSlideIndex < topic.pptSlides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    };


    if (!topic) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700">
                <p className="text-gray-500 text-lg">{t('library.selectTopic')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 rounded-2xl flex flex-col h-full shadow-2xl border border-gray-700 overflow-hidden">
            <div className="flex-shrink-0 bg-gray-900/80 p-2 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <TabButton icon={BookOpenIcon} active={activeTab === 'LESSON'} onClick={() => setActiveTab('LESSON')}>{t('library.lessonTab')}</TabButton>
                    <TabButton icon={PresentationChartBarIcon} active={activeTab === 'PPT'} onClick={() => setActiveTab('PPT')} disabled={!hasSlides}>{t('library.pptTab')}</TabButton>
                    <TabButton icon={LinkIcon} active={activeTab === 'SOURCES'} onClick={() => setActiveTab('SOURCES')}>{t('library.sourcesTab')}</TabButton>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 'LESSON' && (
                    <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 p-6">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">{topic.title}</h2>
                        <p className="whitespace-pre-wrap">{topic.summary}</p>

                        {topic.pdfLinks && topic.pdfLinks.length > 0 && (
                            <>
                                <h3 className="mt-8">{t('library.pdfLinks')}</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {topic.pdfLinks.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 hover:underline">
                                                {link.title || link.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'PPT' && (
                    <div className="w-full h-full flex flex-col items-center justify-start p-4">
                        {hasSlides && currentSlide ? (
                           <div className="w-full h-full flex flex-col p-4">
                                <div className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg shadow-lg p-6 flex flex-col justify-center text-center mb-4">
                                    <h3 className="text-2xl font-bold text-green-300 mb-4">{currentSlide.title}</h3>
                                    <ul className="space-y-3 text-lg text-gray-200 list-none p-0">
                                        {currentSlide.content.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                                <div className="flex-shrink-0 flex items-center justify-between">
                                     <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ChevronLeftIcon className="w-6 h-6 text-white"/>
                                     </button>
                                     <div className="text-center">
                                        <p className="text-sm text-gray-300">
                                            {t('library.slide')} {currentSlideIndex + 1} / {topic.pptSlides.length}
                                        </p>
                                        <a href={currentSlide.sourcePdf.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline">
                                            {t('library.sourcePdf')}: {currentSlide.sourcePdf.title}
                                        </a>
                                     </div>
                                     <button onClick={handleNextSlide} disabled={currentSlideIndex === topic.pptSlides.length - 1} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ChevronRightIcon className="w-6 h-6 text-white"/>
                                     </button>
                                </div>
                           </div>
                        ) : (
                             <p className="m-auto text-gray-500 text-lg">{t('library.noSlides')}</p>
                        )}
                    </div>
                )}
                
                {activeTab === 'SOURCES' && (
                     <div className="prose prose-invert prose-lg max-w-none p-6">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">{t('library.allSources')}</h2>
                        <ul className="space-y-4 not-prose p-0 m-0 list-none">
                            {allSources.map((source, index) => (
                                <li key={index} className="bg-gray-800 p-4 rounded-lg flex items-start gap-4">
                                    <ExternalLinkIcon className="w-6 h-6 mt-1 text-green-400 flex-shrink-0" />
                                    <div>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-semibold no-underline hover:underline">
                                           {source.title || 'Untitled Source'}
                                        </a>
                                        <p className="text-xs text-gray-500 break-all mt-1 no-underline">{source.uri}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};