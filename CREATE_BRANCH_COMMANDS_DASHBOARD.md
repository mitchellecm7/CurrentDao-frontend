# Create Branch Commands - Dashboard Feature

## Run these commands in your terminal:

### 1. Navigate to your project directory
```bash
cd "C:\Users\HomePC\Documents\D\CurrentDao-frontend"
```

### 2. Make sure you're on the main branch
```bash
git checkout main
```

### 3. Pull latest changes from main
```bash
git pull origin main
```

### 4. Create the new feature branch
```bash
git checkout -b feature/personalized-dashboard
```

### 5. Verify you're on the new branch
```bash
git branch
```

You should see:
```
* feature/personalized-dashboard
  main
```

### 6. Check the status to see all the new files
```bash
git status
```

You should see all the dashboard files as untracked/modified:
```
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   package.json
        modified:   package-lock.json
        modified:   src/App.tsx
        new file:   components/dashboard/Dashboard.tsx
        new file:   components/dashboard/WidgetLibrary.tsx
        new file:   components/dashboard/widgets/AnalyticsWidget.tsx
        new file:   components/dashboard/widgets/CommunityWidget.tsx
        new file:   components/dashboard/widgets/PortfolioWidget.tsx
        new file:   components/dashboard/widgets/TreasuryWidget.tsx
        new file:   app/page.tsx
        new file:   PR_DESCRIPTION_DASHBOARD.md
        new file:   PR_CREATION_COMMANDS_DASHBOARD.md
```

### 7. Install dependencies (if not already done)
```bash
npm install
```

### 8. Test the implementation
```bash
npm run dev
```
Navigate to http://localhost:3000 and verify:
- Dashboard loads with Portfolio and Treasury widgets
- Drag-and-drop reordering works
- Widget resizing functions
- Add/remove widgets work
- Layout persists on refresh
- Reset to default works
- Responsive design adapts to screen size

### 9. Run linting (if configured)
```bash
npm run lint
```

### 10. Build check
```bash
npm run build
```

## Branch Naming Convention
- Feature branches: `feature/description-with-hyphens`
- Bug fixes: `fix/description-with-hyphens`
- Hotfixes: `hotfix/description-with-hyphens`

## File Organization
All dashboard-related files are organized in:
```
components/dashboard/          # Main dashboard components
├── Dashboard.tsx             # Core dashboard logic
├── WidgetLibrary.tsx         # Widget management
└── widgets/                  # Individual widget components
    ├── PortfolioWidget.tsx
    ├── TreasuryWidget.tsx
    ├── CommunityWidget.tsx
    └── AnalyticsWidget.tsx
```

## Dependencies Added
- `react-grid-layout`: ^2.2.3
- `@types/react-grid-layout`: ^1.3.5

## Testing Checklist
- [ ] Dashboard renders without errors
- [ ] Drag-and-drop widget reordering works
- [ ] Widget resizing maintains constraints
- [ ] Add widget functionality works
- [ ] Remove widget functionality works
- [ ] Layout persistence across sessions
- [ ] Reset to default restores initial state
- [ ] Responsive breakpoints function correctly
- [ ] No console errors in browser
- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors</content>
<parameter name="filePath">c:\Users\HomePC\Documents\D\CurrentDao-frontend\CREATE_BRANCH_COMMANDS_DASHBOARD.md