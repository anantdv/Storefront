import { getApiClient, simulateLatency } from './api.client';
import { useConfigStore } from '../store/useConfigStore';
import { MOCK_WAREHOUSES } from './mockData';

export interface WarehouseStock {
  warehouse: string;
  actualQty: number;
}

export const inventoryService = {
  async getItemStock(itemCode: string): Promise<WarehouseStock[]> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      // Return mock warehouses with varying stock amounts based on item code
      const modifier = itemCode.charCodeAt(itemCode.length - 1) % 5;
      const stocks = MOCK_WAREHOUSES.map(w => ({
        warehouse: w.name,
        actualQty: Math.max(0, w.qty - modifier * 2)
      }));
      return simulateLatency(stocks);
    }

    const client = getApiClient();
    // Query Bin standard document or Stock Ledger Entry summary in ERPNext
    const response = await client.get('/api/resource/Bin', {
      params: {
        fields: '["warehouse", "actual_qty"]',
        filters: `[["item_code", "=", "${itemCode}"]]`
      }
    });

    return response.data.data.map((bin: any) => ({
      warehouse: bin.warehouse,
      actualQty: bin.actual_qty || 0
    }));
  }
};
