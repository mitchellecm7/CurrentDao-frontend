import React, {useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet, ScrollView} from 'react-native';
import TradingCard from '../components/TradingCard';
import OfflineIndicator from '../components/OfflineIndicator';
import {checkOfflineMode} from '../services/offlineService';
import {fetchMarkets} from '../services/tradeService';

export default function HomeScreen({navigation}) {
  const [offline, setOffline] = useState(false);
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    checkOfflineMode().then(setOffline);
    fetchMarkets().then(setMarkets).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <OfflineIndicator offline={offline} />
      <Text style={styles.title}>CurrentDao Energy Trading</Text>
      <ScrollView style={styles.marketList}>
        {markets.map((item) => (
          <TradingCard key={item.id} market={item} />
        ))}
      </ScrollView>
      <View style={styles.actions}>
        <Button title="Go to Trading" onPress={() => navigation.navigate('Trade')} />
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#ffffff'},
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 12},
  marketList: {marginBottom: 16},
  actions: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}
});