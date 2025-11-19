import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePeerList } from '../hooks';
import { EmptyPeersList } from '../components/EmptyPeersList';
import { PeerCard } from '../components/PeerCard';
import { PeerListHeader } from '../components/PeerListHeader';
import { PeerListLoading } from '../components/PeerListLoading';
import { nearbyStyles } from '../styles';
import type { Peer } from '../entities';

export default function NearbyScreen() {
  const navigation = useNavigation<any>();
  const {
    peers,
    loading,
    refreshing,
    establishSecureConnection,
    loadPeers,
    getConnectedPeersCount,
  } = usePeerList();

  const handlePeerChat = (peer: Peer) => {
    if (peer.status !== 'connected' && peer.status !== 'secure') {
      return;
    }

    navigation.navigate('P2PChat', {
      peerId: peer.userId,
      peerName: peer.userId,
    });
  };

  const renderPeer = ({ item }: { item: Peer }) => (
    <PeerCard
      peer={item}
      onChat={handlePeerChat}
      onSecureConnection={establishSecureConnection}
    />
  );

  if (loading && peers.length === 0) {
    return (
      <SafeAreaView style={nearbyStyles.loadingContainer}>
        <PeerListLoading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={nearbyStyles.container}>
      <PeerListHeader connectedCount={getConnectedPeersCount()} onRefresh={loadPeers} />

      <FlatList
        data={peers}
        renderItem={renderPeer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          nearbyStyles.peersList,
          peers.length === 0 && nearbyStyles.emptyList,
        ]}
        ListEmptyComponent={<EmptyPeersList />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadPeers}
            colors={['#2196F3']}
          />
        }
      />
    </SafeAreaView>
  );
}
