import { getPublicApiClient, simulateLatency } from './api.client';
import { STORE_CONFIG } from '../config/store.config';

export interface PricingRule {
  name: string;
  itemCode: string;
  priceListRate: number;
  discountPercentage: number;
  validUpto?: string;
}

export const pricingService = {
  async getPricingRule(itemCode: string, customerId?: string): Promise<PricingRule | null> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) {
      // Mock pricing rule for SonicWave headphones
      if (itemCode === 'SKU-ELE-001') {
        return simulateLatency({
          name: 'Summer Sale Audio 20%',
          itemCode,
          priceListRate: 249.99,
          discountPercentage: 20
        });
      }
      return simulateLatency(null);
    }

    const client = getPublicApiClient();
    // Fetch pricing rules matched by item code
    try {
      const response = await client.get('/api/resource/Pricing Rule', {
        params: {
          filters: `[["item_code", "=", "${itemCode}"]]`,
          fields: '["name", "discount_percentage", "rate_or_discount"]'
        }
      });

      if (response.data.data && response.data.data.length > 0) {
        const rule = response.data.data[0];
        return {
          name: rule.name,
          itemCode,
          priceListRate: 0, // Resolved separately by Item Price
          discountPercentage: rule.discount_percentage || 0
        };
      }
    } catch {
      return null;
    }
    return null;
  }
};
