# CurrentDao API Examples

Common use cases and code snippets for the CurrentDao API.

## Trading

### Execute a Market Buy
```bash
curl -X POST https://api.currentdao.org/v1/trading/execute \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "XLM/USDC", "side": "buy", "amount": 100}'
```

## Oracles

### Get Weather Forecast
```bash
curl https://api.currentdao.org/v1/oracles/weather/forecast?region=US-EAST
```

## Analytics

### Fetch Historical Data
```javascript
const history = await client.analytics.getHistory({
  metric: 'energy_demand',
  start: '2026-01-01',
  end: '2026-04-01'
});
```
