// Mock React imports for development environment

// Mock React implementation for when dependencies aren't installed
const mockSetState = function<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  return [initialValue, () => {}];
};

const mockUseEffect = function(effect: () => void | (() => void), deps?: any[]) {
  // Mock effect - does nothing
};

const mockUseCallback = function<T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
  return callback;
};

const mockUseMemo = function<T>(factory: () => T, deps: any[]): T {
  return factory();
};

const mockUseRef = function<T>(initialValue: T): { current: T } {
  return { current: initialValue };
};

// Mock React hooks
export const useState = mockSetState;
export const useEffect = mockUseEffect;
export const useCallback = mockUseCallback;
export const useMemo = mockUseMemo;
export const useRef = mockUseRef;

// Mock React component type
export type FC<P = {}> = (props: P) => any;

// Mock React.createElement
export const createElement = function(type: any, props: any, ...children: any[]) {
  return { type, props, children };
};

// Mock React component
const MockComponent = function({ children, ...props }: any) {
  return createElement('div', props, children);
};

// Mock motion components
export const motion = {
  div: MockComponent,
  button: MockComponent,
  form: MockComponent,
  input: MockComponent,
  span: MockComponent,
  h1: MockComponent,
  h2: MockComponent,
  h3: MockComponent,
  p: MockComponent,
  ul: MockComponent,
  li: MockComponent,
  section: MockComponent,
  article: MockComponent,
  header: MockComponent,
  footer: MockComponent,
  main: MockComponent,
  aside: MockComponent,
  nav: MockComponent,
};

export const AnimatePresence = function({ children }: any) {
  return children;
};

// Mock lucide-react icons
const createIcon = function(emoji: string) {
  return function({ className, ...props }: any) {
    return createElement('span', { className, ...props }, emoji);
  };
};

export const Shield = createIcon('🛡️');
export const Users = createIcon('👥');
export const Plus = createIcon('+');
export const X = createIcon('×');
export const Check = createIcon('✓');
export const AlertTriangle = createIcon('⚠️');
export const Clock = createIcon('🕐');
export const Play = createIcon('▶️');
export const Pause = createIcon('⏸️');
export const RotateCcw = createIcon('🔄');
export const CheckCircle = createIcon('✅');
export const Zap = createIcon('⚡');
export const Brain = createIcon('🧠');
export const Search = createIcon('🔍');
export const TrendingUp = createIcon('📈');
export const Eye = createIcon('👁️');
export const Info = createIcon('ℹ️');
export const BarChart3 = createIcon('📊');
export const Calculator = createIcon('🧮');
export const ChevronDown = createIcon('▼');
export const ChevronUp = createIcon('▲');
export const EyeOff = createIcon('🙈');
