import { useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { IconButton } from "react-native-paper";

import { useSdkStore } from "../store";
import { globalColors, globalStyles } from "../theme/global.styles";

export const MessageFieldBox = () => {
  const sendMessage = useSdkStore(state=>state.sendMessage);
  const isSdkStarted = useSdkStore(state=>state.isStarted);
  const [inputMessage, setInputMessage] = useState('');

  function sendMyMessage() {
    if (inputMessage === '') {
      return setInputMessage('');
    }
    sendMessage(inputMessage);
    setInputMessage('');
  }

  return (
    <View>
      <View style={style.separator}/>
      <View style={{
        flexDirection: 'row',
        marginHorizontal: 10,
      }}>
        <TextInput
          placeholder='Type your message'
          placeholderTextColor={'gray'}
          style={[globalStyles.messageInput, {width:'90%'}]}
          editable={isSdkStarted}
          enterKeyHint='done'
          inputMode='text'
          defaultValue={inputMessage}
          onChangeText={(text:string) => setInputMessage(text)}
          onSubmitEditing={() =>sendMyMessage()}
        />
        <IconButton
          icon='send'
          disabled={!isSdkStarted}
          iconColor={globalColors.secondaryColor}
          onPress={async () =>{
            sendMyMessage();
            Keyboard.dismiss();
          }}
        />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  separator: {
    marginBottom: 10,
    height: 0.5,
    width: '100%',
    backgroundColor: 'gray',
  }
});