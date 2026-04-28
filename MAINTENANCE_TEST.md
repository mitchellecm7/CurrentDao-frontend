# Maintenance Mode Testing Instructions

To test the maintenance mode feature, create a `.env.local` file in the root directory with the following configuration:

```env
# Enable maintenance mode for testing
MAINTENANCE_MODE=true
MAINTENANCE_END_TIME=2024-12-31T23:59:59Z
MAINTENANCE_MESSAGE=We're performing scheduled maintenance to improve our services. We'll be back shortly!
MAINTENANCE_WHITELISTED_IPS=127.0.0.1,::1
MAINTENANCE_TWITTER=https://twitter.com/currentdao
MAINTENANCE_DISCORD=https://discord.gg/currentdao
MAINTENANCE_GITHUB=https://github.com/CurrentDao-org
```

## Testing Steps:

1. Add the above configuration to your `.env.local` file
2. Start the development server: `npm run dev`
3. Navigate to any page (e.g., http://localhost:3000)
4. You should be redirected to the maintenance page with a 503 status
5. The maintenance page should show:
   - Countdown timer
   - Social media links
   - Auto-refresh functionality when maintenance ends
6. Test IP whitelisting by accessing from different IPs
7. Test maintenance API endpoint: `GET /api/maintenance/config`

## Features Implemented:

✅ Maintenance page with countdown timer
✅ Environment variable configuration
✅ IP whitelisting support
✅ Social media links
✅ Auto-refresh when maintenance ends
✅ SEO-friendly (503 status code)
✅ Next.js middleware implementation
✅ Configuration API endpoint

## Environment Variables:

- `MAINTENANCE_MODE`: Enable/disable maintenance mode (true/false)
- `MAINTENANCE_END_TIME`: ISO 8601 timestamp for maintenance end
- `MAINTENANCE_MESSAGE`: Custom maintenance message
- `MAINTENANCE_WHITELISTED_IPS`: Comma-separated list of whitelisted IPs
- `MAINTENANCE_TWITTER`: Twitter link for status updates
- `MAINTENANCE_DISCORD`: Discord link for status updates
- `MAINTENANCE_GITHUB`: GitHub link for status updates
