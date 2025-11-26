import React from 'react';
import moment from 'moment';
import { useI18n } from '@/i18n';
import { Clock, Coffee, Utensils } from 'lucide-react';


type StatusKey = "IN" | "OUT" | "LUNCH_OUT" | "LUNCH_IN";

interface StatTimeProps {
  time: string
  type: StatusKey
}


const STAT_ICON: Record<StatusKey, JSX.Element> = {
  IN: <Clock size={20} />,
  OUT: <Clock size={20} />,
  LUNCH_OUT: <Utensils size={20} />,
  LUNCH_IN: <Coffee size={20} />
};

const STAT_I18N = (t: (k: string) => string): Record<StatusKey, string> => ({
  IN: t('home.checkIn'),
  OUT: t('home.checkOut'),
  LUNCH_OUT: t('home.lunchOut'),
  LUNCH_IN: t('home.lunchIn')
});

const StatTime: React.FC<AppointmentCalendarProps> = ({time, type}) => {
  const { t } = useI18n();
  const label = STAT_I18N(t);
  const timeDisplay = time ? moment(time).format('LT') : '--:--';

  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-1 text-blue-600 dark:text-blue-300">
        {STAT_ICON[type]}
      </div>
      <span className="text-lg font-bold text-gray-800 dark:text-white">{timeDisplay}</span>
      <span className="text-xs text-gray-500 uppercase">{label[type]}</span>
    </div>
  )
}

export default StatTime;