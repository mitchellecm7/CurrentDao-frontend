# CurrentDao Python SDK

The official Python SDK for interacting with the CurrentDao platform.

## Installation

```bash
pip install currentdao-sdk
```

## Quick Start

```python
from currentdao import CurrentDaoClient

client = CurrentDaoClient(api_key='YOUR_API_KEY')

# Get market stats
stats = client.analytics.get_stats()
print(f"Active Users: {stats['activeUsers']}")

# Fetch oracle price
price = client.oracles.get_price('XLM')
print(f"Current XLM Price: {price}")
```

## Features
- Full async support
- Automatic retry logic
- Type hinting for all endpoints
- Secure credential management
