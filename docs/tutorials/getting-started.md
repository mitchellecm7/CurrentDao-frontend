# Getting Started with CurrentDao Development

Welcome to the CurrentDao developer ecosystem! This guide will help you build your first integration.

## 1. Get an API Key
Sign up for a developer account at [developers.currentdao.org](https://developers.currentdao.org) and generate your first API key.

## 2. Choose Your SDK
We offer SDKs for multiple platforms:
- [JavaScript SDK](../sdk/javascript/README.md)
- [Python SDK](../sdk/python/README.md)

## 3. Your First API Call
Here is how to fetch the current energy price from our oracle network using the JS SDK:

```javascript
const price = await client.oracles.getPrice('ENERGY_X');
console.log(`Current Price: $${price}`);
```

## 4. Building a Plugin
If you want to extend the CurrentDao UI, check out our [Plugin System Guide](../plugins/README.md).

## Support
Join our [Discord](https://discord.gg/currentdao) for real-time developer support.
