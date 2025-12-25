import React, { use, useEffect, useState, type JSX } from 'react';
import moment from 'moment';
import { useI18n } from '@/i18n';
import { Clock, Coffee } from 'lucide-react';
import type { StatusKey } from '../../domain/employee-check-in';
import { useDependenciesInjection } from '@/common/providers/dependency-injection-provider';
import clsx from 'clsx';

interface StatTimeProps {
  time: string
  type: StatusKey
}


const STAT_ICON: Record<StatusKey, JSX.Element> = {
  EMPTY: <Clock size={20} />,
  IN: <Clock size={20} />,
  'IN-OUT': <Coffee size={20} />,
  'IN-OUT-IN': <Coffee size={20} />,
  'IN-OUT-IN-OUT': <Clock size={20} />,
};

const STAT_I18N = (t: (k: string) => string): Record<StatusKey, string> => ({
  EMPTY: t('home.notRegistered'),
  IN: t('home.checkIn'),
  'IN-OUT': t('home.lunchOut'),
  'IN-OUT-IN': t('home.lunchIn'),
  'IN-OUT-IN-OUT': t('home.checkOut'),
});

const STATUS_COLORS: Record<StatusKey, string> = {
  EMPTY: "gray",
  IN: "blue",
  "IN-OUT": "orange",
  "IN-OUT-IN": "orange",
  "IN-OUT-IN-OUT": "blue",
};

const StatTime: React.FC<StatTimeProps> = ({time}) => {
  const { t } = useI18n();
  const label = STAT_I18N(t);
  const [type, setType] = useState<StatusKey>('EMPTY');
  const timeDisplay = time ? moment(time).format('LT') : '--:--';
   const { getStatusByLogUseCase } = useDependenciesInjection();

   const getButtonColor = () => {
    const c = STATUS_COLORS[type];
    return `
      bg-${c}-100
      dark:bg-${c}-900
      text-${c}-600
      dark:text-${c}-300
    `;
  };

  useEffect(() => {
    
    getStatusByLogUseCase.execute(time).then((result) => result.ok && setType(result.value));

  }, [time]);

  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div className={clsx(
      "p-2 rounded-full mb-1", getButtonColor())}>
        {STAT_ICON[type]}
      </div>
      <span className="text-lg font-bold text-gray-800 dark:text-white">{timeDisplay}</span>
      <span className="text-xs text-gray-500 uppercase">{label[type]}</span>
    </div>
  )
}

export default StatTime;