import { storage } from './storage';

// Demo authentication service
export const auth = {
  async signIn(email, password) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const token = `demo_token_${Date.now()}`;
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    await storage.saveToken(token);
    await storage.saveUser(user);

    return { token, user };
  },

  async signUp(userData) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    const { email, password, name, phone } = userData;

    // Demo validation
    if (!email || !password || !name) {
      throw new Error('Name, email and password are required');
    }

    const token = `demo_token_${Date.now()}`;
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    await storage.saveToken(token);
    await storage.saveUser(user);

    return { token, user };
  },

  async signOut() {
    await storage.clear();
  },

  async getSession() {
    const token = await storage.getToken();
    const user = await storage.getUser();

    if (token && user) {
      return { token, user };
    }

    return null;
  },
};
