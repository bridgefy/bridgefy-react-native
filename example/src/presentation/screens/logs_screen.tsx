import { FlatList, Text, View } from "react-native";
import { useEffect, useRef } from "react";

import { globalStyles } from "../theme/global.styles";
import { useSdkStore } from "../store";
import { LogType } from "../../domain";
import { CommonButton } from "../components";

export const LogsScreen = () => {
  const isSdkStarted = useSdkStore(state=>state.isStarted);
  const sendMessage = useSdkStore(state=>state.sendMessage);
  const clearLogs = useSdkStore(state=>state.clearLogs);
  const logList = useSdkStore(state=>state.logList);
  const scroll = useRef<FlatList>(null);
  const scrollLogList = useSdkStore(state=>state.scrollLogList);

  const onScreenLoad = () => {
    useSdkStore.setState({scrollLogList: scroll});
  }
  useEffect(() => {
    onScreenLoad();
  }, [])


  function getStyle(type: LogType){
    switch (type) {
      case LogType.normal:
        return globalStyles.logNormal;
      case LogType.success:
        return globalStyles.logSuccess;
      case LogType.error:
        return globalStyles.logError;
      case LogType.finish:
        return globalStyles.logFinish;
      default:
        return globalStyles.logNormal;
    }
  }

  return (
    <View style={ globalStyles.screenContainer }>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
      }}>
        <CommonButton 
          icon='send'
          label='Send "Hi!"'
          disabled={!isSdkStarted}
          onPress={()=>{
            sendMessage('Hi!');
          }}
        />
        <View style={{width:20}}/>
        <CommonButton 
          icon='trash-outline'
          label='Clear logs'
          onPress={() => clearLogs()}
        />
      </View>
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        data={logList}
        ref={scrollLogList}
        onContentSizeChange={() => {
          if (logList.length>1)
            scrollLogList?.current?.scrollToIndex({index: (logList.length-2), animated: true});
        }}
        onScrollToIndexFailed={()=>{
          scrollLogList?.current?.scrollToEnd({animated: true});
        }}
        refreshing
        style={globalStyles.flatlist}
        renderItem={({item})=>(
          <Text
            style={[
              globalStyles.log,
              getStyle(item.type),
            ]}
          >
            {item.text}
          </Text>
        )}
      />
    </View>
  );
}