import { StyleSheet } from 'react-native';

export const nearbyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerCount: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  refreshIcon: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  peersList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  peerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  peerCardDisabled: {
    opacity: 0.5,
  },
  peerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  peerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#F44336',
  },
  peerDetails: {
    flex: 1,
  },
  peerId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  peerSubtext: {
    fontSize: 13,
    color: '#757575',
  },
  signalContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  chatButton: {
    backgroundColor: '#2196F3',
  },
  secureButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
