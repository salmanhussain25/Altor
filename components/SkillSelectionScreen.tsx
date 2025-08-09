import React, { useState } from 'react';
import { Skill, CourseOutline, UserProfile, Badge, AppMode, CourseComplexity } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { generateCourseOutline } from '../services/geminiServices';
import { TrashIcon } from './icons/TrashIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ProgressDashboard } from './ProgressDashboard';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import type { Language } from '../translations';
import { UsersIcon } from './icons/UsersIcon';
import { FriendPanel } from './FriendPanel';
import { LibraryIcon } from './icons/LibraryIcon';
import { CollectionIcon } from './icons/CollectionIcon';
import { HubPanel } from './HubPanel';
import { ShareIcon } from './icons/ShareIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SkillSelectionScreenProps {
  userProfile: UserProfile;
  allUsers: UserProfile[];
  onSelectSkill: (skillId: string) => void;
  onDeleteSkill: (skillId: string) => void;
  onCreateSkill: (outline: CourseOutline) => void;
  onCreateQuest: (skillName: string) => void;
  onSetMode: (mode: AppMode) => void;
  onViewCertificate: (badge: Badge) => void;
  onLogout: () => void;
  onAddSkillFromHub: (skill: Skill) => void;
  onRateSkill: (skillName: string, rating: number) => void;
  onShareSkillToHub: (skillId: string) => void;
  onUpdateProfile: (updatedProfileData: Partial<UserProfile>) => void;
}

type MainView = 'COURSES' | 'PROGRESS' | 'FRIENDS' | 'HUB';

const SkillCard: React.FC<{
  skill: Skill;
  onSelect: () => void;
  onDelete: () => void;
  onShare: () => void;
  title: string;
}> = ({ skill, onSelect, onDelete, onShare, title }) => {
    const Icon = skill.icon || BookOpenIcon;
    const { t } = useTranslations();

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };
    
    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare();
    };

    return (
        <div
            onClick={onSelect}
            className="bg-gray-800 border-2 border-gray-700 rounded-2xl group hover:border-purple-500 hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-purple-500/20 w-full flex flex-col cursor-pointer"
            aria-label={`Select course ${skill.name}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
        >
            <div className="p-6 text-center flex-grow flex flex-col justify-center items-center relative">
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={handleDeleteClick}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title={title}
                        aria-label={title}
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex justify-center items-center mb-4 h-24">
                    <Icon className="w-20 h-20 transition-transform duration-300 group-hover:scale-110 text-purple-400" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-100">{skill.name}</h2>
            </div>
            
            <div className="p-3 bg-gray-900/50 border-t-2 border-gray-700 text-center">
                 {skill.isSharedToHub ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold">
                        <CheckCircleIcon className="w-5 h-5" />
                        {t('dashboard.sharedToHub')}
                    </div>
                ) : (
                    <button 
                        onClick={handleShareClick}
                        className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-semibold w-full transition-colors"
                    >
                        <ShareIcon className="w-5 h-5"/>
                        {t('dashboard.shareToHub')}
                    </button>
                )}
            </div>
        </div>
    );
};


const ModeButton: React.FC<{ title: string; description: string; icon: React.FC<any>; onClick: () => void; colorClass: string; }> = ({ title, description, icon: Icon, onClick, colorClass}) => (
  <button 
    onClick={onClick}
    className={`bg-gray-800 border-2 border-gray-700 rounded-2xl p-6 sm:p-8 text-center group hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg w-full flex flex-col items-center justify-start ${colorClass}`}
  >
    <div className="flex justify-center items-center mb-4 h-16 w-16">
      <Icon className="w-16 h-16 transition-transform duration-300 group-hover:scale-110" />
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mt-4 mb-2">{title}</h2>
    <p className="text-gray-400 text-sm sm:text-base flex-grow">{description}</p>
  </button>
);


const TabButton: React.FC<{icon: React.FC<any>, active: boolean, onClick: () => void, children: React.ReactNode, hasNotification?: boolean}> = ({ icon: Icon, active, onClick, children, hasNotification }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 px-6 py-3 text-lg font-semibold transition-colors ${active ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
  >
    <Icon className="w-6 h-6" />
    {children}
    {hasNotification && (
        <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-pink-500 ring-2 ring-gray-900" />
    )}
  </button>
);

const CoursesView: React.FC<Omit<SkillSelectionScreenProps, 'onLogout' | 'onViewCertificate' | 'allUsers' | 'onAddSkillFromHub' | 'onRateSkill' | 'onUpdateProfile'>> = (props) => {
  const { userProfile, onSelectSkill, onDeleteSkill, onCreateSkill, onCreateQuest, onSetMode, onShareSkillToHub } = props;
  const [prompt, setPrompt] = useState('');
  const [numTopics, setNumTopics] = useState(10);
  const [complexity, setComplexity] = useState<CourseComplexity>('Beginner');
  const [view, setView] = useState<'CHOOSING' | 'TUTOR_SETUP' | 'OUTLINE_REVIEW'>('CHOOSING');
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useTranslations();

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
        setIsLoading(true);
        setError(null);
        try {
            const generatedOutline = await generateCourseOutline(prompt.trim(), numTopics, complexity, language as Language);
            setOutline(generatedOutline);
            setView('OUTLINE_REVIEW');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate course outline.");
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const handleConfirmCreation = () => {
      if (outline) {
          onCreateSkill(outline);
      }
  };

  const ComplexityButton: React.FC<{ level: CourseComplexity, children: React.ReactNode }> = ({ level, children }) => (
    <button
      type="button"
      onClick={() => setComplexity(level)}
      className={`flex-1 p-2 rounded-md transition-colors text-sm font-medium ${complexity === level ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
    >
      {children}
    </button>
  );

  if (view === 'CHOOSING') {
      return (
        <div className="w-full max-w-7xl fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch justify-center gap-6">
            <ModeButton 
              title={t('dashboard.learnNewSkill')}
              description={t('dashboard.learnNewSkillDesc')}
              icon={BookOpenIcon}
              onClick={() => setView('TUTOR_SETUP')}
              colorClass="hover:border-purple-500 hover:shadow-purple-500/20 [&>div>svg]:text-purple-400"
            />
             <ModeButton 
              title={t('dashboard.library')}
              description={t('dashboard.libraryDesc')}
              icon={LibraryIcon}
              onClick={() => onSetMode('LIBRARY')}
              colorClass="hover:border-green-500 hover:shadow-green-500/20 [&>div>svg]:text-green-400"
            />
            <ModeButton 
              title={t('dashboard.interviewPrep')}
              description={t('dashboard.interviewPrepDesc')}
              icon={BriefcaseIcon}
              onClick={() => onSetMode('INTERVIEW_PREP')}
              colorClass="hover:border-blue-500 hover:shadow-blue-500/20 [&>div>svg]:text-blue-400"
            />
            <ModeButton 
              title={t('dashboard.solveDoubt')}
              description={t('dashboard.solveDoubtDesc')}
              icon={LightBulbIcon}
              onClick={() => onSetMode('DOUBT_SOLVER')}
              colorClass="hover:border-teal-500 hover:shadow-teal-500/20 [&>div>svg]:text-teal-400"
            />
        </div>
      );
    }
    
    if (view === 'OUTLINE_REVIEW' && outline) {
        return (
            <div className="w-full max-w-2xl fade-in bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{outline.skillName}</h2>
                <p className="text-center text-gray-400 mb-6">{t('dashboard.courseOutlineTitle')}</p>
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-4 mb-8">
                    {outline.topics.map((topic, index) => (
                        <li key={index} className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold text-white">{index + 1}. {topic.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{topic.description}</p>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setView('TUTOR_SETUP')} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors">
                        {t('dashboard.backToEdit')}
                    </button>
                    <button onClick={handleConfirmCreation} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors">
                        {t('dashboard.createAndStart')}
                    </button>
                </div>
            </div>
        )
    }

    if (view === 'TUTOR_SETUP') {
       return (
        <div className="w-full max-w-5xl fade-in">
           <button onClick={() => setView('CHOOSING')} className="text-purple-400 hover:text-purple-300 mb-8">{t('dashboard.backToModeSelection')}</button>
          <div className="w-full max-w-2xl mx-auto mb-12">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'A beginner's guide to Python'"
                className="w-full px-5 py-3 sm:py-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-base sm:text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label className="block text-md font-semibold text-gray-200 mb-2">{t('dashboard.courseComplexity')}</label>
                    <div className="flex bg-gray-900/50 rounded-lg p-1">
                        <ComplexityButton level="Beginner">{t('dashboard.beginner')}</ComplexityButton>
                        <ComplexityButton level="Intermediate">{t('dashboard.intermediate')}</ComplexityButton>
                        <ComplexityButton level="Advanced">{t('dashboard.advanced')}</ComplexityButton>
                    </div>
                </div>
                <div>
                     <label htmlFor="num-topics-input" className="block text-md font-semibold text-gray-200 mb-2">{t('dashboard.courseLengthLabel')}</label>
                     <input
                        id="num-topics-input"
                        type="number"
                        min="0"
                        value={numTopics}
                        onChange={(e) => setNumTopics(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        placeholder="e.g., 10"
                     />
                </div>
            </div>

            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
             <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                      onClick={handleGenerateOutline}
                      disabled={isLoading || !prompt.trim() || numTopics <= 0}
                      className="flex-1 bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                  >
                      {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t('dashboard.generateOutline')}
                  </button>
                  <button
                      onClick={() => onCreateQuest(prompt)}
                      disabled={isLoading || !prompt.trim()}
                      className="flex-1 bg-pink-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-pink-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                  >
                     {t('dashboard.askFriend')}
                  </button>
              </div>
               <p className="text-center text-gray-400 text-sm mt-4">{t('dashboard.askFriendDesc')}</p>
          </div>

          {userProfile.skills.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-center mb-8 border-b border-gray-700 pb-4">{t('dashboard.orContinueCourse')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                    {userProfile.skills.map((skill) => (
                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            onSelect={() => onSelectSkill(skill.id)}
                            onDelete={() => onDeleteSkill(skill.id)}
                            onShare={() => onShareSkillToHub(skill.id)}
                            title={t('dashboard.deleteCourse', { courseName: skill.name })}
                        />
                    ))}
                </div>
              </>
          )}
        </div>
      );
    }
    return null; // Should not happen
};


export const SkillSelectionScreen: React.FC<SkillSelectionScreenProps> = (props) => {
  const { userProfile, allUsers, onLogout, onViewCertificate, onSelectSkill, onAddSkillFromHub, onRateSkill, onShareSkillToHub, onUpdateProfile } = props;
  const [activeTab, setActiveTab] = useState<MainView>('COURSES');
  const { t } = useTranslations();
  const hasPendingQuests = userProfile.quests.some(q => q.status === 'PENDING');

  const AnimationLibrarySelector = () => (
    <div className="hidden sm:flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
        <span className="text-gray-400 text-sm font-semibold px-2 hidden lg:block">{t('misc.animation')}:</span>
        <button
            onClick={() => onUpdateProfile({ preferredAnimationLibrary: 'p5js' })}
            className={`px-3 py-1 rounded-md transition-colors text-sm font-medium ${userProfile.preferredAnimationLibrary === 'p5js' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
            p5.js
        </button>
        <button
            onClick={() => onUpdateProfile({ preferredAnimationLibrary: 'threejs' })}
            className={`px-3 py-1 rounded-md transition-colors text-sm font-medium ${userProfile.preferredAnimationLibrary === 'threejs' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
            Three.js
        </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4 sm:p-8 overflow-y-auto">
      <header className="w-full max-w-7xl flex justify-between items-center mb-10">
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            {t('app.title')}
          </h1>
           <p className="text-lg sm:text-xl text-gray-300">
            {userProfile.name ? t('dashboard.welcome', { name: userProfile.name }) : t('app.tagline')}
           </p>
        </div>
        <div className="flex items-center gap-4">
            <AnimationLibrarySelector />
            <LanguageSelector />
            {userProfile.name && (
            <button onClick={onLogout} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <LogoutIcon className="w-5 h-5" />
                {t('dashboard.logout')}
            </button>
            )}
        </div>
      </header>

      <div className="flex justify-center border-b border-gray-700 mb-8 w-full max-w-7xl">
        <TabButton icon={BookOpenIcon} active={activeTab === 'COURSES'} onClick={() => setActiveTab('COURSES')}>
          {t('dashboard.myCourses')}
        </TabButton>
        <TabButton icon={CollectionIcon} active={activeTab === 'HUB'} onClick={() => setActiveTab('HUB')}>
          {t('hub.title')}
        </TabButton>
        <TabButton icon={ChartBarIcon} active={activeTab === 'PROGRESS'} onClick={() => setActiveTab('PROGRESS')}>
          {t('dashboard.myProgress')}
        </TabButton>
         <TabButton icon={UsersIcon} active={activeTab === 'FRIENDS'} onClick={() => setActiveTab('FRIENDS')} hasNotification={hasPendingQuests}>
          {t('dashboard.friends')}
        </TabButton>
      </div>

      <main className="w-full max-w-7xl">
          {activeTab === 'COURSES' ? (
              <CoursesView {...props} />
          ) : activeTab === 'PROGRESS' ? (
              <ProgressDashboard userProfile={userProfile} onViewCertificate={onViewCertificate} />
          ) : activeTab === 'HUB' ? (
              <HubPanel 
                allUsers={allUsers} 
                currentUser={userProfile}
                onAddSkill={onAddSkillFromHub}
                onRateSkill={onRateSkill}
              />
          ) : (
             <FriendPanel userProfile={userProfile} onSelectSkill={onSelectSkill} />
          )}
      </main>
    </div>
  );
};