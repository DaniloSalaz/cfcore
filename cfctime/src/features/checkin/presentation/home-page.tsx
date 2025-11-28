import { Cloud, MapPin, Clock, MinusCircle, Coffee, Utensils } from 'lucide-react';
import clsx from 'clsx';
import moment from 'moment';
import  StatTime from './components/stat-time'
import { useHomePage } from './hooks/use-home-page';

export function HomePage() {
  const {
    t,
    isSync,
    lastLog,
    currentTime,
    getStatus,
    getButtonLabel,
    getButtonColor,
  } = useHomePage();

  return (
   <div className="flex flex-col h-full px-6 pt-8 pb-4 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          <MinusCircle size={16} className={clsx(
              lastLog === 'IN' ? 'text-green-500' : 
              lastLog === 'OUT' ? 'text-orange-500' : 'text-gray-400'
          )} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{getStatus()}</span>
        </div>
        <div className={clsx(
          'flex flex-col items-center', isSync ? 'text-green-500' : 'text-gray-500'
        )
        }>
            <Cloud size={24} />
            <span className="text-[10px] font-bold uppercase">{isSync ? t('home.sync') : t('home,unsync')}</span>
        </div>
      </div>

      {/* Clock */}
      <div className="mt-8 flex flex-col items-center">
        <h1 className="text-5xl font-light text-gray-800 dark:text-white tabular-nums">
          {currentTime.format('LTS')}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-lg">
          {currentTime.format('LL')}
        </p>
      </div>

      {/* Main Button */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        <button
          // onClick={handleMainButton}
          // disabled={loading}
          className={clsx(
            "w-64 h-64 rounded-full border-4 flex items-center justify-center shadow-xl transition-all transform active:scale-95 bg-white dark:bg-gray-800",
            getButtonColor()
          )}
        >
          <span className="text-3xl font-bold tracking-widest">
            {getButtonLabel()}
          </span>
        </button>

        <div className="mt-6 flex items-start space-x-2 text-gray-500 dark:text-gray-400 text-center max-w-xs">
          <MapPin size={20} className="flex-shrink-0 text-blue-500 mt-1" />
          <span className="text-sm">10 Infinite Loop, Cupertino, California 95014, United States</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Check In */}
        <StatTime  type={'IN'}/>
        <StatTime time={moment()} type={'IN'}/>
        <StatTime time={moment()} type={'IN'}/>
        <StatTime time={moment()} type={'IN'}/>
      </div>

      <button 
        // onClick={() => setShowModal(true)}
        className="w-full py-3 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline"
      >
        {/* {t('home.request_manual')} */}
      </button>

      {/* Manual Request Modal */}
      
    </div>
  );
}
