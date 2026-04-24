import React, {useState} from 'react';
import {View, Text, Button, TextInput, StyleSheet, Alert} from 'react-native';
import {createSwap, fetchBalance} from '../services/tradeService';
import {checkOfflineMode} from '../services/offlineService';
import {triggerNotification} from '../services/notificationService';

export default function TradeScreen() {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('ENERGY');
  const [balance, setBalance] = useState(0);

  const handleSubmit = async () => {
    const isOffline = await checkOfflineMode();
    if (isOffline) {
      Alert.alert('Offline', 'Trade queued for submission when back online.');
    }
    const result = await createSwap(asset, Number(amount));
    if (result?.success) {
      triggerNotification('Trade executed', `Swapped ${amount} ${asset}`);
      setBalance(await fetchBalance());
      setAmount('');
      return;
    }
    Alert.alert('Error', 'Could not process trade.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trading Desk</Text>
      <Text style={styles.subtitle}>Balance: {balance}</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
      />
      <Button title="Execute Trade" onPress={handleSubmit} disabled={!amount || Number(amount) <= 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f5f6fa'},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 8},
  subtitle: {fontSize: 16, marginBottom: 14},
  input: {borderWidth: 1, borderColor: '#cccccc', padding: 10, marginBottom: 12, borderRadius: 6}
});