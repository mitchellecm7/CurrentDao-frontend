# Route-Level Code Splitting Quick Reference

## Quick Start - Using Dynamic Route Splitting

### 1. Create a New Route with Code Splitting

```typescript
// app/my-feature/page.tsx
"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/loading/LoadingSkeleton";
import { usePrefetchRoute } from "@/utils/routeLoader";

// Dynamically import your components
const MyComponent = dynamic(
  () =>
    import("@/components/MyComponent").then((m) => ({
      default: m.MyComponent,
    })),
  {
    loading: () => <LoadingSkeleton variant="dashboard" />,
    ssr: true,
  },
);

export default function MyFeaturePage() {
  // Prefetch adjacent routes on mount
  usePrefetchRoute(() => import("@/app/other-route/page"), {
    prefetchOnHover: true,
  });

  return (
    <div>
      <Suspense fallback={<LoadingSkeleton variant="dashboard" />}>
        <MyComponent />
      </Suspense>
    </div>
  );
}
```

### 2. Add Prefetching to Navigation Links

```typescript
// components/Navigation.tsx
import Link from "next/link";
import { usePrefetchRoute } from "@/utils/routeLoader";

export function Navigation() {
  usePrefetchRoute(() => import("@/app/dao/treasury/page"), {
    prefetchOnHover: true,
  });

  return (
    <nav>
      <Link href="/dao/treasury">Treasury</Link>
    </nav>
  );
}
```

### 3. Using Loading Skeletons

```typescript
import { LoadingSkeleton, LoadingSpinner } from '@/components/loading/LoadingSkeleton';

// Use specific variants
<Suspense fallback={<LoadingSkeleton variant="dashboard" />}>
  <Dashboard />
</Suspense>

// Or use spinner for minimal loading state
<Suspense fallback={<LoadingSpinner size="md" message="Loading..." />}>
  <Component />
</Suspense>
```

## API Reference

### `usePrefetchRoute(importFunc, options?)`

Preload a route component when component mounts or on hover.

**Parameters:**

- `importFunc`: Function that imports the route component
- `options`: Configuration object
  - `prefetchOnHover`: boolean (default: true) - Prefetch on hover events

**Example:**

```typescript
usePrefetchRoute(() => import("@/app/page"), { prefetchOnHover: true });
```

### `LoadingSkeleton` Component

Display contextual loading state while chunks load.

**Props:**

- `variant`: 'default' | 'dashboard' | 'table' | 'cards' | 'chart'
- `delay`: number (ms) - Delay before showing skeleton
- `className`: string - Additional CSS classes

**Example:**

```typescript
<LoadingSkeleton variant="dashboard" delay={200} />
```

### Dynamic Import Pattern

Standard Next.js dynamic import with loading skeleton.

```typescript
const Component = dynamic(
  () => import("./Component").then((mod) => ({ default: mod.Component })),
  {
    loading: () => <LoadingSkeleton variant="cards" />,
    ssr: true, // Server-side render on first load
  },
);
```

## Bundle Analysis Commands

```bash
# Build and analyze bundle
npm run build

# Generate bundle report
npm run bundle:report

# Visual bundle analysis
npm run build:analyze

# Lighthouse performance audit
npm run lighthouse
```

## Performance Best Practices

### ✅ DO:

- Use dynamic imports for route-level code splitting
- Display loading skeletons for better UX
- Prefetch adjacent/likely next routes
- Keep main bundle under 200KB
- Monitor LCP and other Core Web Vitals

### ❌ DON'T:

- Import heavy components statically if they're route-specific
- Skip loading states (use skeletons)
- Prefetch all routes (only likely next ones)
- Exceed 200KB threshold for main bundle
- Ignore Core Web Vitals warnings

## Measuring Performance

### Check Bundle Size

```bash
npm run bundle:report
# View: bundle-report.json
```

### Check Core Web Vitals

```bash
npm run lighthouse
# View: lighthouse-report.html
```

### Monitor in Application

```typescript
import { performanceMonitor } from "@/utils/performance/monitoring";

performanceMonitor.onMetric((entry) => {
  console.log(`${entry.name}: ${entry.value}ms (${entry.rating})`);
});
```

## Troubleshooting

### Bundle size increasing?

```bash
npm run build:analyze
# Check for large dependencies
# Use dynamic imports for heavy components
```

### Slow LCP?

- Reduce main bundle size
- Move heavy components to separate chunks
- Add prefetching to frequently accessed routes
- Optimize images with next/image

### Loading skeleton not showing?

- Ensure component is wrapped with `<Suspense>`
- Check `dynamic()` import has `loading` prop
- Verify skeleton variant matches content type

### Prefetch not working?

- Ensure `usePrefetchRoute()` is called in client component ('use client')
- Check that import path is correct
- Verify route actually exists

## CI/CD Integration

Bundle analysis automatically runs on:

- Every push to main/develop
- Every pull request
- Build fails if main bundle > 200KB

View results:

1. Check GitHub Actions workflow
2. Download bundle-report.json artifact
3. Review in CI/CD dashboard

## Next Steps

1. **Implement for all routes**: Apply code splitting to any remaining routes
2. **Monitor metrics**: Track LCP and bundle size over time
3. **Optimize further**: Identify and split large chunks
4. **Cache strategy**: Configure optimal cache headers

## Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)
- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION_GUIDE.md)
- [Full Implementation Docs](./CODE_SPLITTING_IMPLEMENTATION.md)
