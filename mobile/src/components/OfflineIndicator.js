import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function OfflineIndicator({offline}) {
  if (!offline) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Offline mode active: transactions queued</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#ffcc00', padding: 8, borderRadius: 6, marginBottom: 10},
  label: {color: '#663c00', fontWeight: 'bold'}
});