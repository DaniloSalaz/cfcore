import { useI18n } from "@/i18n";
import { useDependenciesInjection } from "@/common/providers/dependency-injection-provider";
import { useEffect, useMemo, useState } from "react";
import type { EmployeeCheckIn, LogType } from "../../domain/employee-check-in";
import moment from 'moment';

type StatusKey =
  | 'EMPTY'
  | 'IN'
  | 'IN-OUT'
  | 'IN-OUT-IN'
  | 'IN-OUT-IN-OUT';

const STATUS_LABEL = (t: (key: string) => string): Record<StatusKey, string> => ({
  EMPTY: t('home.notRegistered'),
  IN: t('home.working'),
  'IN-OUT': t('home.lunchBreak'),
  'IN-OUT-IN': t('home.working'),
  'IN-OUT-IN-OUT': t('home.finished'),
});

const STATUS_COLORS: Record<StatusKey, string> = {
  EMPTY: 'blue',
  IN: 'orange',
  'IN-OUT': 'green',
  'IN-OUT-IN': 'orange',
  'IN-OUT-IN-OUT': 'gray',
};

const BUTTON_LABELS = (t: (key: string) => string): Record<StatusKey, string> => ({
  EMPTY: t('home.checkIn'),
  IN: t('home.checkOut'),
  'IN-OUT': t('home.lunchOut'),
  'IN-OUT-IN': t('home.lunchIn'),
  'IN-OUT-IN-OUT': t('home.finished'),
});
  

export function useHomePage() {
  const { t } = useI18n();
  const [isSync, setSync] = useState<boolean>(false);
  const [lastLog, setLastLog] = useState<LogType>();
  const [checkInLogs, setCheckInlogs] = useState<EmployeeCheckIn[]>([]);
  const [currentTime, setCurrentTime] = useState(moment());
  const [keyStatus, setKeyStatus] = useState<StatusKey>('EMPTY');

  const statusLabels = useMemo(() => STATUS_LABEL(t), [t]);
  const buttonLabels = useMemo(() => BUTTON_LABELS(t), [t]);
  const { getTodaysCheckinsUseCase, localCheckinRepository } = useDependenciesInjection();

  const getStatus = () => {
    return statusLabels[keyStatus];
  }

  const getButtonLabel = () => {
    return buttonLabels[keyStatus];
  }

  const getButtonColor = () => {
    const c = STATUS_COLORS[keyStatus];
    return `
      border-${c}-500
      text-${c}-500
      hover:bg-${c}-50
      dark:hover:bg-gray-800
    `;
  };

  useEffect(() => {
    console.log('Entro')
    localCheckinRepository.getAllUnsynced()
      .then((result) => result.ok ? result.value.length : -1 )
      .then((count) => setSync(count === 0));
    getTodaysCheckinsUseCase.execute()
      .then((result) => result.ok ? result.value : [])
      .then((items) => setCheckInlogs(items));
    setLastLog(checkInLogs.at(-1)?.logType);
    const statusString = checkInLogs.map((item) => item.logType === 'IN' ? 'IN' : 'OUT').join('-') || 'EMPTY';
    const validStatusKeys: StatusKey[] = ['EMPTY', 'IN', 'IN-OUT', 'IN-OUT-IN', 'IN-OUT-IN-OUT'];
    setKeyStatus(validStatusKeys.includes(statusString as StatusKey) ? statusString as StatusKey : 'EMPTY');
  }, []);

    // Clock ticker
  useEffect(() => {console.log('Entro clock')
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    t,
    isSync,
    lastLog,
    checkInLogs,
    currentTime,
    getStatus,
    getButtonLabel,
    getButtonColor,
  }
}