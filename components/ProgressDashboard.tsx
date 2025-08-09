import React from 'react';
import { UserProfile, Badge } from '../types';
import { ActivityChart } from './ActivityChart';
import { CertificatePreview } from './CertificatePreview';
import { AwardIcon } from './icons/AwardIcon';
import { CoinIcon } from './icons/CoinIcon';
import { FireIcon } from './icons/FireIcon';
import { StarIcon } from './icons/StarIcon';
import { useTranslations } from '../hooks/useTranslations';

interface ProgressDashboardProps {
  userProfile: UserProfile;
  onViewCertificate: (badge: Badge) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; value: number | string; label: string; color: string }> = ({ icon, value, label, color }) => (
    <div className="bg-gray-800/80 p-4 rounded-xl flex items-center shadow-lg border border-gray-700/50">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);


const BadgeDisplay: React.FC<{badge: Badge}> = ({badge}) => {
    return (
        <div className="flex items-center bg-gray-800/80 p-3 rounded-lg w-full max-w-xs shadow-md border border-gray-700/50" title={`Awarded on ${new Date(badge.dateAwarded).toLocaleDateString()}`}>
            <AwardIcon className="w-10 h-10 text-yellow-400 mr-4 flex-shrink-0"/>
            <div>
                <p className="font-semibold text-white text-md">{badge.title}</p>
                <p className="text-xs text-gray-400">{badge.courseName}</p>
            </div>
        </div>
    )
};


export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userProfile, onViewCertificate }) => {
  const { t } = useTranslations();
  return (
    <div className="w-full max-w-6xl mx-auto fade-in">
        
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<CoinIcon className="w-7 h-7 text-yellow-300"/>} value={userProfile.points.toLocaleString()} label={t('progress.points')} color="bg-yellow-500/20" />
          <StatCard icon={<FireIcon className="w-7 h-7 text-orange-400"/>} value={userProfile.currentStreak} label={t('progress.dayStreak')} color="bg-orange-500/20" />
          <StatCard icon={<StarIcon className="w-7 h-7 text-purple-400"/>} value={userProfile.longestStreak} label={t('progress.longestStreak')} color="bg-purple-500/20" />
      </div>

      {/* Activity Chart Section */}
      <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-200">{t('progress.sevenDayActivity')}</h2>
          <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700/50">
            <ActivityChart activityLog={userProfile.activityLog} />
          </div>
      </div>

      {userProfile.badges.length > 0 && (
        <>
          {/* Achievements (Badges) Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-200">{t('progress.yourAchievements')}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {userProfile.badges.map(badge => <BadgeDisplay key={badge.id} badge={badge} />)}
            </div>
          </div>
          
          {/* Certificates Section */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-200">{t('progress.yourCertificates')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userProfile.badges.map(badge => (
                <CertificatePreview 
                  key={`cert-${badge.id}`} 
                  badge={badge} 
                  studentName={userProfile.name} 
                  onClick={() => onViewCertificate(badge)} 
                />
              ))}
            </div>
          </div>
        </>
      )}
       {userProfile.badges.length === 0 && (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">{t('progress.noAchievements')}</p>
          </div>
        )}
    </div>
  );
};