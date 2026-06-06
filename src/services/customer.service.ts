import { getApiClient, simulateLatency } from './api.client';
import { useConfigStore } from '../store/useConfigStore';
import { Address } from '../types/shop.types';

export const customerService = {
  async addAddress(address: Address): Promise<Address> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return simulateLatency({ ...address, id: `addr_${Math.random().toString(36).substr(2, 9)}` });
    }

    const client = getApiClient();
    // ERPNext creates Address document
    const response = await client.post('/api/resource/Address', {
      address_title: address.recipientName,
      address_type: 'Billing',
      address_line1: address.street,
      city: address.city,
      state: address.state,
      pincode: address.zipCode,
      country: address.country,
      phone: address.phone,
      is_primary_address: address.isDefault ? 1 : 0
    });
    
    return {
      ...address,
      id: response.data.data.name
    };
  },

  async updateAddress(addressId: string, address: Partial<Address>): Promise<boolean> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return simulateLatency(true);
    }

    const client = getApiClient();
    await client.put(`/api/resource/Address/${addressId}`, {
      address_line1: address.street,
      city: address.city,
      state: address.state,
      pincode: address.zipCode,
      country: address.country,
      phone: address.phone,
      is_primary_address: address.isDefault ? 1 : 0
    });

    return true;
  },

  async deleteAddress(addressId: string): Promise<boolean> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return simulateLatency(true);
    }

    const client = getApiClient();
    await client.delete(`/api/resource/Address/${addressId}`);
    return true;
  }
};
