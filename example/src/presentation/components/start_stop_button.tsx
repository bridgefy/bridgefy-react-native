import { Button } from 'react-native-paper';

import { useSdkStore } from "../store";
import { globalColors } from "../theme/global.styles";
import { LogType } from '../../domain';

export const StartStopButton = () => {
  const isSdkInitialized = useSdkStore(state=>state.isSdkInitialized);
  const arePermissionsGranted = useSdkStore(state=>state.arePermissionsGranted);
  const isSdkStarted = useSdkStore(state=>state.isStarted);
  const addLog = useSdkStore(state=>state.addLog);
  const initializedSdk = useSdkStore(state=>state.initializedSdk);
  const startSdk = useSdkStore(state=>state.start);
  const stopSdk = useSdkStore(state=>state.stop);

  return (
    <Button
      icon={isSdkStarted ? 'stop-circle' : 'checkmark-circle'}
      mode='elevated'
      textColor={globalColors.primaryColor}
      buttonColor="white"
      style={{
        marginEnd: 10,
      }}
      onPress={async () =>{
        if (isSdkStarted)
          await stopSdk();
        else{
          let init = true;
          if (!isSdkInitialized || !arePermissionsGranted){
            init = await initializedSdk();
            if (!init){
              addLog({
                text: 'Bridgefy is not initialized',
                type: LogType.error,
              });
              return;
            }
          }

          if (init)
            await startSdk({});
        }
      }}
    >
      {isSdkStarted ? 'Stop' : 'Start'}
    </Button>
  );
}
