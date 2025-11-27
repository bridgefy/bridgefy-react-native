import { SDKEventEntity, type EventStats, type FilterType, type SDKEvent } from "../entities/iSDKEvent";

export class EventFilterService {
  filterByType(events: SDKEvent[], type: FilterType): SDKEvent[] {
    if (type === 'all') return events;
    return events.filter((event) => event.type === type);
  }

  filterBySearch(events: SDKEvent[], searchText: string): SDKEvent[] {
    if (!searchText.trim()) return events;
    return events.filter((event) => {
      const entity = new SDKEventEntity(event);
      return entity.matchesSearch(searchText);
    });
  }

  applyFilters(
    events: SDKEvent[],
    type: FilterType,
    searchText: string
  ): SDKEvent[] {
    let filtered = this.filterByType(events, type);
    filtered = this.filterBySearch(filtered, searchText);
    return filtered;
  }

  calculateStats(events: SDKEvent[]): EventStats {
    return {
      all: events.length,
      info: events.filter((e) => e.type === 'info').length,
      success: events.filter((e) => e.type === 'success').length,
      warning: events.filter((e) => e.type === 'warning').length,
      error: events.filter((e) => e.type === 'error').length,
    };
  }
}
