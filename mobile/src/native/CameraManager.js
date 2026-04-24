import {PermissionsAndroid, Platform} from 'react-native';

export async function requestCameraPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}
