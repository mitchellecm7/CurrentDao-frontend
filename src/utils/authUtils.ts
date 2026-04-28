// Simple role-based access control utilities
// In production, this should integrate with proper authentication system

export type UserRole = 'owner' | 'admin' | 'maintainer' | 'signer' | 'user';

export interface User {
  id: string;
  address: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

// Mock user data - in production, this would come from authentication system
const mockUsers: User[] = [
  {
    id: 'user-1',
    address: '0x1234567890123456789012345678901234567890',
    name: 'Alice (Owner)',
    role: 'owner',
    isActive: true
  },
  {
    id: 'user-2',
    address: '0x2345678901234567890123456789012345678901',
    name: 'Bob (Admin)',
    role: 'admin',
    isActive: true
  },
  {
    id: 'user-3',
    address: '0x3456789012345678901234567890123456789012',
    name: 'Charlie (Maintainer)',
    role: 'maintainer',
    isActive: true
  },
  {
    id: 'user-4',
    address: '0x4567890123456789012345678901234567890123',
    name: 'David (Signer)',
    role: 'signer',
    isActive: true
  }
];

export class AuthUtils {
  // Get current user - in production, this would use session/JWT
  static getCurrentUser(): User | null {
    // For demo purposes, return the first admin user
    // In production, this would decode JWT or check session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    
    // Default to admin for demo
    return mockUsers[1]; // Bob (Admin)
  }

  // Check if user has required role or higher
  static hasRole(user: User | null, requiredRole: UserRole): boolean {
    if (!user || !user.isActive) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      'owner': 4,
      'admin': 3,
      'maintainer': 2,
      'signer': 1,
      'user': 0
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  // Check if user can access dependency dashboard
  static canAccessDependencyDashboard(user: User | null = null): boolean {
    const currentUser = user || this.getCurrentUser();
    return this.hasRole(currentUser, 'admin') || this.hasRole(currentUser, 'owner');
  }

  // Get API headers for authenticated requests
  static getAuthHeaders(): Record<string, string> {
    const user = this.getCurrentUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (user) {
      headers['x-user-role'] = user.role;
      headers['x-user-address'] = user.address;
    }
    
    // Add API key if configured
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'demo-api-key';
    headers['x-api-key'] = apiKey;
    
    return headers;
  }

  // Mock login for demo purposes
  static mockLogin(userId: string): void {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  // Mock logout
  static mockLogout(): void {
    localStorage.removeItem('currentUser');
  }

  // Get all available users for demo
  static getMockUsers(): User[] {
    return mockUsers;
  }

  // Check if user is in demo mode
  static isDemoMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost';
  }
}
