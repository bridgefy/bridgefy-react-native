import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Peer } from '../entities';
import { PeerFormatter } from '../utils';
import { nearbyStyles } from '../styles';

interface PeerCardProps {
  peer: Peer;
  onChat: (peer: Peer) => void;
  onSecureConnection: (peerId: string) => void;
}

export const PeerCard: React.FC<PeerCardProps> = ({
  peer,
  onChat,
  onSecureConnection,
}) => {
  const canChat = peer.status === 'connected' || peer.status === 'secure';
  const signalInfo = PeerFormatter.getSignalIcon(peer.signal);

  return (
    <TouchableOpacity
      style={[nearbyStyles.peerCard, !canChat && nearbyStyles.peerCardDisabled]}
      onPress={() => onChat(peer)}
      disabled={!canChat}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={nearbyStyles.peerHeader}>
        <View style={nearbyStyles.peerInfo}>
          <View
            style={[
              nearbyStyles.statusIndicator,
              peer.status === 'connected' || peer.status === 'secure'
                ? nearbyStyles.statusConnected
                : nearbyStyles.statusDisconnected,
            ]}
          />
          <View style={nearbyStyles.peerDetails}>
            <Text style={nearbyStyles.peerId}>
              {PeerFormatter.formatUserId(peer.userId)}
            </Text>
            <Text style={nearbyStyles.peerSubtext}>
              Connected{' '}
              {PeerFormatter.formatConnectionTime(peer.connectionTime)}
            </Text>
            {peer.status === 'secure' && (
              <Text style={nearbyStyles.peerSubtext}>🔒 Secure Connection</Text>
            )}
          </View>
        </View>

        {/* Signal */}
        <View style={nearbyStyles.signalContainer}>
          <Icon name={signalInfo.icon} size={20} color={signalInfo.color} />
          <Text style={nearbyStyles.signalText}>{peer.signal}%</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={nearbyStyles.actionButtons}>
        <TouchableOpacity
          style={[nearbyStyles.actionButton, nearbyStyles.chatButton]}
          onPress={() => onChat(peer)}
          disabled={!canChat}
        >
          <Icon name="chat" size={18} color="#fff" />
          <Text style={nearbyStyles.actionButtonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[nearbyStyles.actionButton, nearbyStyles.secureButton]}
          onPress={() => onSecureConnection(peer.userId)}
        >
          <Icon name="lock" size={18} color="#fff" />
          <Text style={nearbyStyles.actionButtonText}>Secure Channel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
