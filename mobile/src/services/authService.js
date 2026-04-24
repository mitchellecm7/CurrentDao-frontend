import ReactNativeBiometrics from 'react-native-biometrics';

export async function isBiometricAvailable() {
  try {
    const {available} = await ReactNativeBiometrics.isSensorAvailable();
    return available;
  } catch {
    return false;
  }
}

export async function authenticateBiometric() {
  try {
    const {success} = await ReactNativeBiometrics.simplePrompt({promptMessage: 'Authenticate to CurrentDao'});
    return success;
  } catch {
    return false;
  }
}
