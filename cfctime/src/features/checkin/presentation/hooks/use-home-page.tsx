import { useI18n } from "@/i18n";
import { useDependenciesInjection } from "@/common/providers/dependency-injection-provider";
import { useEffect, useMemo, useState } from "react";
import type { EmployeeCheckIn, LogType } from "../../domain/employee-check-in";
import moment from 'moment';
import type { StatusKey } from "../types";
import { toast } from "sonner";

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

const NEXT_LOG_TYPE: Record<StatusKey, LogType | null> = {
  EMPTY: 'IN',
  IN: 'OUT',
  'IN-OUT': 'IN',
  'IN-OUT-IN': 'OUT',
  'IN-OUT-IN-OUT': null,
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
  const { getTodaysCheckinsUseCase, localCheckinRepository, submitCheckInUseCase } = useDependenciesInjection();

  const calculateStatusKey = (logs: EmployeeCheckIn[]): StatusKey => {
    const statusString = logs.map((item) => item.logType === 'IN' ? 'IN' : 'OUT').join('-') || 'EMPTY';
    const validStatusKeys: StatusKey[] = ['EMPTY', 'IN', 'IN-OUT', 'IN-OUT-IN', 'IN-OUT-IN-OUT'];
    return validStatusKeys.includes(statusString as StatusKey) ? statusString as StatusKey : 'EMPTY';
  }
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

  const handleCreateCheckIn = () => {
    if(!NEXT_LOG_TYPE[keyStatus]) return;

    const payload = {
      logType: NEXT_LOG_TYPE[keyStatus]!,
      time: moment().format('YYYY-MM-DDTHH:mm:ss'),
    };
    submitCheckInUseCase.execute(payload)
      .then((result) => {
        if(result.ok) {
          // Update local state
          setCheckInlogs((prev) => [...prev, result.value]);
          setLastLog(result.value.logType);
          setKeyStatus(calculateStatusKey([...checkInLogs, result.value]));
          toast.success(t('home.' + (result.value.logType === 'IN' ? 'checkInSuccess' : 'checkOutSuccess')));
        }else {
          const message = result.error?.message || t('home.' + (payload.logType === 'IN' ? 'checkInError' : 'checkOutError'));
          console.log('Error checkin:', message);
          toast.error(message);
        }
        
      });
  }

  useEffect(() => {
    console.log('Entro')
    localCheckinRepository.getAllUnsynced()
      .then((result) => result.ok ? result.value.length : -1 )
      .then((count) => setSync(count === 0));
    getTodaysCheckinsUseCase.execute()
      .then((result) => result.ok ? result.value : [])
      .then((items) => setCheckInlogs(items));
    setLastLog(checkInLogs.at(-1)?.logType);
    setKeyStatus(calculateStatusKey(checkInLogs));
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
    keyStatus,
    getStatus,
    getButtonLabel,
    getButtonColor,
    handleCreateCheckIn,
  }
}