'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { microgridService } from '@/services/microgrid/microgrid-service';
import { MicrogridSnapshot, IoTDeviceData } from '@/types/microgrid';

export interface UseMicrogridDataOptions {
    pollingIntervalMs?: number;
    autoStart?: boolean;
}

export function useMicrogridData(options: UseMicrogridDataOptions = {}) {
    const { pollingIntervalMs = 5000, autoStart = true } = options;
    const [snapshot, setSnapshot] = useState<MicrogridSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isLive, setIsLive] = useState(autoStart);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSnapshot = useCallback(async () => {
        try {
            const data = await microgridService.getSnapshot();
            setSnapshot(data);
            if (isLoading) setIsLoading(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch microgrid snapshot'));
            if (isLoading) setIsLoading(false);
        }
    }, [isLoading]);

    const toggleLive = () => setIsLive(prev => !prev);

    const isolateNode = async (nodeId: string) => {
        const success = await microgridService.isolateNode(nodeId);
        if (success) {
            // Re-fetch snapshot immediately to update UI
            await fetchSnapshot();
            return true;
        }
        return false;
    };

    const reconnectNode = async (nodeId: string) => {
        const success = await microgridService.reconnectNode(nodeId);
        if (success) {
            await fetchSnapshot();
            return true;
        }
        return false;
    };

    const getIoTMetrics = async (deviceId: string): Promise<IoTDeviceData | null> => {
        try {
            return await microgridService.getIoTDeviceData(deviceId);
        } catch {
            return null;
        }
    };

    useEffect(() => {
        if (!isLive) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        // Initial fetch
        fetchSnapshot();

        // Start polling
        timerRef.current = setInterval(fetchSnapshot, pollingIntervalMs);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isLive, fetchSnapshot, pollingIntervalMs]);

    return {
        snapshot,
        isLoading,
        error,
        isLive,
        toggleLive,
        refresh: fetchSnapshot,
        isolateNode,
        reconnectNode,
        getIoTMetrics,
    };
}
