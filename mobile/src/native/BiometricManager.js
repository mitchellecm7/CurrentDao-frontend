import ReactNativeBiometrics from 'react-native-biometrics';

export async function availableBiometricSensors() {
  try {
    const {available, biometryType} = await ReactNativeBiometrics.isSensorAvailable();
    return {available, biometryType};
  } catch {
    return {available: false, biometryType: null};
  }
}

export async function verifyBiometricUser() {
  return ReactNativeBiometrics.simplePrompt({promptMessage: 'Verify your identity'});
}
