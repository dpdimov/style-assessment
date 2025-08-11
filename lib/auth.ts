// Simple authentication utilities
// In production, you'd want to use a proper auth library like NextAuth.js

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

// Mock user storage (use a real database in production)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date().toISOString()
  }
]

export const createUser = async (email: string, name: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    createdAt: new Date().toISOString()
  }
  
  mockUsers.push(newUser)
  return newUser
}

export const authenticateUser = async (email: string): Promise<{ user: User; token: string } | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  let user = mockUsers.find(u => u.email === email)
  
  // Create user if doesn't exist (simplified for demo)
  if (!user) {
    user = await createUser(email, email.split('@')[0])
  }
  
  const token = btoa(`${user.id}:${Date.now()}`) // Simple token generation
  
  return { user, token }
}

export const validateToken = (token: string): User | null => {
  try {
    const [userId] = atob(token).split(':')
    return mockUsers.find(u => u.id === userId) || null
  } catch {
    return null
  }
}

// Client-side auth state management
export const getStoredAuth = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, token: null }
  }
  
  const token = localStorage.getItem('auth_token')
  if (!token) {
    return { isAuthenticated: false, user: null, token: null }
  }
  
  const user = validateToken(token)
  if (!user) {
    localStorage.removeItem('auth_token')
    return { isAuthenticated: false, user: null, token: null }
  }
  
  return { isAuthenticated: true, user, token }
}

export const setStoredAuth = (user: User, token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export const clearStoredAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}