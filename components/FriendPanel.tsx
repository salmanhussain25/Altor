
import React from 'react';
import { UserProfile, Quest } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface FriendPanelProps {
  userProfile: UserProfile;
  onSelectSkill: (skillId: string) => void;
}

const FriendCard: React.FC<{ name: string }> = ({ name }) => (
  <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center">
      <SparklesIcon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="font-bold text-white">{name}</p>
      <p className="text-sm text-gray-400">AI Friend</p>
    </div>
  </div>
);

const QuestCard: React.FC<{ quest: Quest; onStart: () => void }> = ({ quest, onStart }) => {
    const { t } = useTranslations();
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                   <p className="text-sm text-gray-400">{t('friends.questTo', { name: quest.toUserId === 'sparky-bot' ? 'Sparky' : quest.toUserId })}</p>
                   <h4 className="font-bold text-lg text-white">{quest.skillName}</h4>
                </div>
                <div className={`text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1.5
                    ${quest.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {quest.status === 'PENDING' ? <ClockIcon className="w-4 h-4"/> : <CheckCircleIcon className="w-4 h-4"/>}
                    {t(`friends.status_${quest.status}`)}
                </div>
            </div>
            {quest.status === 'COMPLETED' ? (
                <button onClick={onStart} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg transition-colors">
                    {t('friends.startLearning')}
                </button>
            ) : (
                <div className="text-sm text-gray-400">
                    Your friend is working on it! You'll be able to start once it's complete.
                </div>
            )}
            <p className="text-xs text-right text-gray-500">{timeAgo(quest.createdAt)}</p>
        </div>
    )
}

export const FriendPanel: React.FC<FriendPanelProps> = ({ userProfile, onSelectSkill }) => {
  const { t } = useTranslations();
  
  const handleStartQuestCourse = (quest: Quest) => {
    const completedSkill = userProfile.skills.find(s => s.name === quest.skillName);
    if(completedSkill) {
        onSelectSkill(completedSkill.id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-100">{t('friends.title')}</h1>
        <p className="text-lg text-gray-400">{t('friends.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-200">{t('friends.myFriends')}</h2>
          <div className="space-y-4">
            {userProfile.friends.map(friend => (
              <FriendCard key={friend.id} name={friend.name} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-200">{t('friends.quests')}</h2>
          <div className="space-y-4">
            {userProfile.quests.length > 0 ? (
                [...userProfile.quests].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(quest => (
                    <QuestCard key={quest.id} quest={quest} onStart={() => handleStartQuestCourse(quest)} />
                ))
            ) : (
                <div className="text-center text-gray-500 bg-gray-800/50 p-8 rounded-lg">
                    {t('friends.noQuests')}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
