import { FlatList } from 'react-native';
import { EventItem } from './EventItem';
import { EmptyEventsList } from './EmptyEventsList';
import type { SDKEvent } from '../entities/iSDKEvent';
import { logsStyles } from '../styles';

interface EventsListProps {
  events: SDKEvent[];
  listRef?: React.RefObject<FlatList<any> | null>;
}

export const EventsList: React.FC<EventsListProps> = ({ events, listRef }) => {
  const renderEvent = ({ item }: { item: SDKEvent }) => (
    <EventItem event={item} />
  );

  return (
    <FlatList
      ref={listRef}
      data={events}
      renderItem={renderEvent}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        logsStyles.eventsList,
        events.length === 0 && logsStyles.emptyList,
      ]}
      ListEmptyComponent={<EmptyEventsList hasEvents={false} />}
      scrollEnabled
      showsVerticalScrollIndicator={true}
      onContentSizeChange={() => {
        if (events.length > 0 && listRef?.current) {
          listRef?.current.scrollToOffset({ offset: 0, animated: false });
        }
      }}
    />
  );
};
