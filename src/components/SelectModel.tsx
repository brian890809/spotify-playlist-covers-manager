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
            <SelectTrigger className="bg-transparent text-sm text-gray-700 dark:text-gray-300 border-0 focus:ring-0 focus:border-0 hover:bg-gray-100 dark:hover:bg-[#333] min-h-0 h-full px-3 mr-0">
                <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white dark:text-gray-300 dark:bg-[#2a2a2a] border-0 shadow-lg rounded-md text-sm">
                <>
                    <SelectItem value="__default">Default</SelectItem>
                    {apiKeys.map((key) => (
                        <SelectItem key={key.id} value={key.llmType}>
                            {key.llmType}
                        </SelectItem>
                    ))}
                </>
            </SelectContent>
        </Select>
    )
}

export default SelectModel