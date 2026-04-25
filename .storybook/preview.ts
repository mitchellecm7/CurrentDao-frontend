import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
        {
          name: 'neutral',
          value: '#f8fafc',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        wide: {
          name: 'Wide',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    a11y: {
      config: {
        rules: [
          {
            // Example: disable color-contrast rule for certain stories
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
      manual: true,
    },
    designToken: {
      config: {
        tokens: {
          colors: {
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
            },
            // Add other color tokens as needed
          },
          spacing: {
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.25rem',
            6: '1.5rem',
            8: '2rem',
            10: '2.5rem',
            12: '3rem',
            16: '4rem',
            20: '5rem',
            24: '6rem',
          },
          typography: {
            fontFamily: {
              sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            fontSize: {
              xs: ['0.75rem', { lineHeight: '1rem' }],
              sm: ['0.875rem', { lineHeight: '1.25rem' }],
              base: ['1rem', { lineHeight: '1.5rem' }],
              lg: ['1.125rem', { lineHeight: '1.75rem' }],
              xl: ['1.25rem', { lineHeight: '1.75rem' }],
              '2xl': ['1.5rem', { lineHeight: '2rem' }],
              '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
              '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },
          },
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English', right: '🇺🇸' },
          { value: 'es', title: 'Spanish', right: '🇪🇸' },
          { value: 'fr', title: 'French', right: '🇫🇷' },
          { value: 'de', title: 'German', right: '🇩🇪' },
          { value: 'ja', title: 'Japanese', right: '🇯🇵' },
          { value: 'zh', title: 'Chinese', right: '🇨🇳' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      
      // Apply theme class to story container
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return (
        <div className={`min-h-screen p-4 ${theme === 'dark' ? 'dark bg-neutral-900' : 'bg-white'}`}>
          <div className="max-w-6xl mx-auto">
            <Story />
          </div>
        </div>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
