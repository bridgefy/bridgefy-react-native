import { useEffect, useRef, useState } from 'react';
import type { EventStats, FilterType, SDKEvent } from '../entities/iSDKEvent';
import { LogsRepository } from '../repositories/implLogsRepository';
import { EventFilterService } from '../services';
import { ClearEventsUseCase, GetEventsUseCase } from '../usecases';

export const useLogs = () => {
  const [events, setEvents] = useState<SDKEvent[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<EventStats>({
    all: 0,
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
  });

  const repositoryRef = useRef(new LogsRepository());
  const filterServiceRef = useRef(new EventFilterService());
  const repository = repositoryRef.current;
  const filterService = filterServiceRef.current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getEventsUseCase = new GetEventsUseCase(repository);
  const clearEventsUseCase = new ClearEventsUseCase(repository);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Cargar eventos iniciales
        const initialEvents = await getEventsUseCase.execute();
        setEvents(initialEvents);
        updateStats(initialEvents);

        // Suscribirse a cambios en eventos
        repository.subscribeToEvents((updatedEvents) => {
          setEvents(updatedEvents);
          updateStats(updatedEvents);
        });
      } catch (error) {
        console.error('Hook initialization error:', error);
      }
    };

    initialize();

    return () => {
      repository.unsubscribeFromEvents();
    };
    // @ts-ignore
  }, [getEventsUseCase, repository, updateStats]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStats = (eventList: SDKEvent[]) => {
    const newStats = filterService.calculateStats(eventList);
    setStats(newStats);
  };

  const getFilteredEvents = (): SDKEvent[] => {
    return filterService.applyFilters(events, filter, searchText);
  };

  const handleClearEvents = async () => {
    try {
      await clearEventsUseCase.execute();
      setFilter('all');
      setSearchText('');
      setEvents([]);
      setStats({
        all: 0,
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
      });
    } catch (error) {
      console.error('Error clearing events:', error);
    }
  };

  return {
    events,
    filter,
    searchText,
    stats,
    filteredEvents: getFilteredEvents(),
    setFilter,
    setSearchText,
    clearEvents: handleClearEvents,
  };
};
