import React, {useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet, Alert} from 'react-native';
import {authenticateBiometric, isBiometricAvailable} from '../services/authService';
import {getGPSLocation} from '../native/GPSManager';

export default function SettingsScreen() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const onAuth = async () => {
    const ok = await authenticateBiometric();
    Alert.alert('Bio Auth', ok ? 'Authentication successful' : 'Authentication failed');
  };

  const onCheckLocation = async () => {
    const loc = await getGPSLocation();
    Alert.alert('GPS Location', loc ? `${loc.latitude}, ${loc.longitude}` : 'Unavailable');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings & Device Integration</Text>
      <Button title="Check Camera Permissions" onPress={() => Alert.alert('Camera', 'Check in native code')} />
      {biometricAvailable && <Button title="Use Biometric Auth" onPress={onAuth} />}
      <Button title="Get GPS Location" onPress={onCheckLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#ffffff'},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 14}
});