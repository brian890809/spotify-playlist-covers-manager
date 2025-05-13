'use client';
import { useEffect, useState } from 'react';
import { ApiKeyEntry } from '@/types/types';

import ApiKey from '@/components/ApiKey';

export default function Settings() {
    const [apiKeys, setApiKey] = useState<ApiKeyEntry[]>([]);

    useEffect(() => {
        const fetchApiKeys = async () => {
            const response = await fetch('/api/api-key');
            if (!response.ok) {
                throw new Error('Get API Key was not ok');
            }
            const data = await response.json();
            setApiKey(data);
        };
        fetchApiKeys().catch((error) => {
            console.error('Error fetching API keys:', error);
        });
    }, []);

    const saveKey = async (apiKeys: ApiKeyEntry[]) => {
        const response = await fetch('/api/api-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiKeys),
        });

        if (!response.ok) {
            throw new Error('Save API Key was not ok');
        }
        const data = await response.json();
        console.log('API keys saved:', data);
    };
    return (
        <ApiKey apiKeys={apiKeys} saveKey={saveKey} />
    );
}