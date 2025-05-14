'use client'

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ApiKeyEntry } from '@/types/types';

const SelectModel = ({ selectedModel, setSelectedModel }: {
    selectedModel: string
    setSelectedModel: (model: string) => void
}) => {
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]); // Initialize with an empty entry

    useEffect(() => {
        const fetchApiKeys = async () => {
            const response = await fetch('/api/api-key');
            if (!response.ok) {
                throw new Error('Get API Key was not ok');
            }
            const keys = await response.json();
            setApiKeys(keys);
        };
        fetchApiKeys();
    }, []);

    return (
        <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-300 dark:border-[#333] focus:border-[#1DB954] mr-0">
                <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent position="item-aligned" className="bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#333]">
                {apiKeys.map((key) => (
                    <SelectItem key={key.id} value={key.llmType}>
                        {key.llmType}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default SelectModel