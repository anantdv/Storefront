import { getApiClient, simulateLatency } from './api.client';
import { useConfigStore } from '../store/useConfigStore';
import { MOCK_USER } from './mockData';
import { UserProfile } from '../types/shop.types';

export const authService = {
  async login(email: string, password?: string): Promise<{ token: string; user: UserProfile }> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      // Simulate validation
      if (email.includes('error')) {
        throw new Error('Invalid email or password');
      }
      return simulateLatency({
        token: `mock-jwt-token-${Math.random().toString(36).slice(2)}`,
        user: {
          ...MOCK_USER,
          email,
          name: email.split('@')[0].toUpperCase(),
        }
      });
    }

    const client = getApiClient();
    const response = await client.post('/api/method/erpnext.api.login_customer', {
      email,
      password
    });
    
    const msg = response.data?.message;
    const loggedEmail = msg?.email || msg?.user || email;
    let name = msg?.full_name || msg?.first_name || msg?.name || loggedEmail.split('@')[0];
    
    try {
      const detailRes = await client.get(`/api/resource/User/${loggedEmail}`);
      name = detailRes.data.data.full_name || detailRes.data.data.first_name || name;
    } catch (e) {
      console.warn('Could not fetch detailed user profile, using fallback:', e);
    }

    let loyaltyPoints = 120; // Default simulated loyalty points fallback
    try {
      // Query customer linked to this email to get loyalty program details
      const custRes = await client.get('/api/resource/Customer', {
        params: {
          fields: '["name","loyalty_program","loyalty_program_tier","loyalty_points"]',
          filters: `[["Customer", "email_id", "=", "${loggedEmail}"]]`
        }
      });
      if (custRes.data?.data && custRes.data.data.length > 0) {
        loyaltyPoints = custRes.data.data[0].loyalty_points || 0;
      } else {
        // Fallback: query Loyalty Point Entry list for customer
        const pointsRes = await client.get('/api/resource/Loyalty Point Entry', {
          params: {
            fields: '["loyalty_points"]',
            filters: `[["Loyalty Point Entry", "customer", "=", "${name}"]]`
          }
        });
        if (pointsRes.data?.data && pointsRes.data.data.length > 0) {
          loyaltyPoints = pointsRes.data.data.reduce((sum: number, entry: any) => sum + (entry.loyalty_points || 0), 0);
        }
      }
    } catch (e) {
      console.warn('Could not fetch Customer loyalty details from ERPNext:', e);
    }

    return {
      token: 'session_active',
      user: {
        email: loggedEmail,
        name,
        loyaltyPoints,
        addresses: []
      }
    };
  },

  async register(name: string, email: string, password?: string): Promise<{ success: boolean; message: string }> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return simulateLatency({ success: true, message: 'Registration successful! Please login.' });
    }

    const client = getApiClient();
    const parts = name.trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';

    await client.post('/api/method/erpnext.api.register_customer', {
      email,
      password,
      first_name,
      last_name
    });

    return { success: true, message: 'Registration successful! You can now log in.' };
  }
};
