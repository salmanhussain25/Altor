
import React, { useState, useMemo } from 'react';
import { UserProfile, Skill } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { SearchIcon } from './icons/SearchIcon';
import { StarIcon } from './icons/StarIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { StarRating } from './StarRating';

interface HubPanelProps {
  allUsers: UserProfile[];
  currentUser: UserProfile;
  onAddSkill: (skill: Skill) => void;
  onRateSkill: (skillName: string, rating: number) => void;
}

const CourseCard: React.FC<{
  skill: Skill;
  onAdd: () => void;
  onRate: (rating: number) => void;
  isAdded: boolean;
  currentUserRating: number;
}> = ({ skill, onAdd, onRate, isAdded, currentUserRating }) => {
  const { t } = useTranslations();
  const Icon = skill.icon;
  
  const averageRating = useMemo(() => {
    if (skill.hubRatings.length === 0) return 0;
    const sum = skill.hubRatings.reduce((acc, r) => acc + r.rating, 0);
    return sum / skill.hubRatings.length;
  }, [skill.hubRatings]);

  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl flex flex-col transition-all duration-300 ease-in-out shadow-lg overflow-hidden">
      <div className="bg-gradient-to-br from-purple-900 to-gray-800 p-6 flex flex-col items-center text-center">
        <Icon className="w-16 h-16 text-purple-400 mb-3" />
        <h3 className="text-xl font-bold text-white">{skill.name}</h3>
        <p className="text-sm text-gray-400">{t('hub.createdBy', { name: skill.creatorName })}</p>
      </div>
      <div className="p-4 space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center text-sm text-gray-300">
          <div className="flex items-center gap-1.5">
            <StarIcon className={`w-5 h-5 ${averageRating > 0 ? 'text-yellow-400' : 'text-gray-600'}`} />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({skill.hubRatings.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
            <span className="font-semibold">{t('hub.users', { count: skill.hubUsers.length })}</span>
          </div>
        </div>

        <div className="flex-grow"></div>

        <div className="pt-4 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400 mb-2">Rate this course</p>
            <StarRating currentRating={currentUserRating} onRate={onRate} />
        </div>
        
        <button
          onClick={onAdd}
          disabled={isAdded}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
          {isAdded ? (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              {t('hub.inYourCourses')}
            </>
          ) : (
            <>
              <PlusCircleIcon className="w-5 h-5" />
              {t('hub.addToCourses')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const HubPanel: React.FC<HubPanelProps> = ({ allUsers, currentUser, onAddSkill, onRateSkill }) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');

  const uniqueSkills = useMemo(() => {
    const allSkills = allUsers.flatMap(u => u.skills).filter(s => s.isSharedToHub);
    const unique: { [key: string]: Skill } = {};
    for (const skill of allSkills) {
      if (!unique[skill.name] || new Date(skill.createdAt) < new Date(unique[skill.name].createdAt)) {
        unique[skill.name] = skill;
      }
    }
    return Object.values(unique).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allUsers]);

  const filteredSkills = useMemo(() => {
    return uniqueSkills.filter(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueSkills, searchTerm]);

  return (
    <div className="w-full max-w-7xl mx-auto fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-100">{t('hub.title')}</h1>
        <p className="text-lg text-gray-400 mt-2">{t('hub.description')}</p>
      </div>

      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('hub.searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-full text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSkills.map(skill => {
            const isAdded = currentUser.skills.some(s => s.name === skill.name);
            const currentUserRating = skill.hubRatings.find(r => r.userId === currentUser.id)?.rating || 0;
            return (
              <CourseCard
                key={skill.name} // Use name for uniqueness in the Hub
                skill={skill}
                onAdd={() => onAddSkill(skill)}
                onRate={(rating) => onRateSkill(skill.name, rating)}
                isAdded={isAdded}
                currentUserRating={currentUserRating}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 bg-gray-800/50 p-12 rounded-lg">
          <p>{t('hub.noCourses')}</p>
        </div>
      )}
    </div>
  );
};