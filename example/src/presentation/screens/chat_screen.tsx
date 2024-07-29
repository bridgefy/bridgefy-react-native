import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import {useEffect, useRef} from 'react';

import {globalColors, globalStyles} from '../theme/global.styles';
import {useSdkStore} from '../store';
import {OriginMessage} from '../../domain';
import {MessageFieldBox} from '../components';

export const ChatScreen = () => {
  const messageList = useSdkStore(state => state.messageList);
  const scroll = useRef<FlatList>(null);
  const scrollMessageList = useSdkStore(state => state.scrollMessageList);

  const onScreenLoad = () => {
    useSdkStore.setState({scrollMessageList: scroll});
  };
  useEffect(() => {
    onScreenLoad();
  }, []);

  return (
    <View style={globalStyles.screenContainer}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 160 : 0}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          data={messageList}
          ref={scrollMessageList}
          onContentSizeChange={() => {
            if (messageList.length > 1) {
              scrollMessageList?.current?.scrollToIndex({
                index: messageList.length - 2,
                animated: true,
              });
            }
          }}
          onScrollToIndexFailed={() => {
            scrollMessageList?.current?.scrollToEnd({animated: true});
          }}
          inverted
          style={[globalStyles.flatlist, {borderWidth: 0, paddingBottom: 0}]}
          contentContainerStyle={{
            flexDirection: 'column-reverse',
          }}
          refreshing
          renderItem={({item}) => (
            <View
              style={[
                globalStyles.messageBuble,
                {
                  alignSelf:
                    item.origin === OriginMessage.me
                      ? 'flex-end'
                      : 'flex-start',
                  backgroundColor:
                    item.origin === OriginMessage.me
                      ? globalColors.primaryColor
                      : globalColors.secondaryColor,
                },
              ]}>
              <Text
                style={{
                  color: 'white',
                }}>
                {item.body}
              </Text>
            </View>
          )}
        />
        <MessageFieldBox />
      </KeyboardAvoidingView>
    </View>
  );
};
