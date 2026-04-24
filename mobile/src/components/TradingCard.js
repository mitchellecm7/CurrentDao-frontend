import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function TradingCard({market}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{market.name}</Text>
      <Text>{`Price: ${market.price}`}</Text>
      <Text>{`Volume: ${market.volume}`}</Text>
      <Text>{`Risk Score: ${market.riskScore}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 2},
  title: {fontWeight: 'bold', marginBottom: 4}
});