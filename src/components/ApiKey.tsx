'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from 'lucide-react';
import { getApiKeys } from '@/utils/ApiKeys';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ApiKeyEntry {
    id: string;
    llmType: string;
    apiKey: string;
}

export default function ApiKey() {
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([{} as ApiKeyEntry]); // Initialize with an empty entry

    useEffect(() => {
        const fetchApiKeys = async () => {
            const keys = await getApiKeys() || [];
            setApiKeys(keys);
        };
        fetchApiKeys();
    }, []);

    const handleInputChange = (id: string, field: keyof Omit<ApiKeyEntry, 'id'>, value: string) => {
        setApiKeys(prevKeys =>
            prevKeys.map(key =>
                key.id === id ? { ...key, [field]: value } : key
            )
        );
    };

    const handleAddRow = () => {
        setApiKeys(prevKeys => [
            ...prevKeys,
            { id: crypto.randomUUID(), llmType: '', apiKey: '' }
        ]);
    };

    const handleRemoveRow = (id: string) => {
        setApiKeys(prevKeys => prevKeys.filter(key => key.id !== id));
    };

    const handleSave = () => {
        // TODO: Implement API call to save the apiKeys state
        console.log("Saving API Keys:", apiKeys);
        alert("Save functionality not yet implemented. Check console for data.");
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
            <h1 className="text-3xl font-bold mb-6">Manage Your <span className="text-[#1DB954]">LLM API</span> Keys</h1>

            <div className="space-y-4">
                {apiKeys.map((keyEntry) => (
                    <div key={keyEntry.id} className="flex items-center space-x-3 p-5 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-sm">
                        <Select
                            value={keyEntry.llmType}
                            onValueChange={(value) => handleInputChange(keyEntry.id, 'llmType', value)}
                        >
                            <SelectTrigger className="w-[180px] border-gray-300 dark:border-gray-700 bg-white dark:bg-[#212121] dark:hover:bg-[#3d3d3d]">
                                <SelectValue placeholder="Select LLM" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#212121] dark:text-gray-200">
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="perplexity">Perplexity</SelectItem>
                                <SelectItem value="claude">Claude</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Paste your API Key here"
                            value={keyEntry.apiKey}
                            onChange={(e) => handleInputChange(keyEntry.id, 'apiKey', e.target.value)}
                            className="flex-grow border-gray-300 dark:border-gray-700 bg-white dark:bg-[#212121] focus-visible:ring-[#1DB954]"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRow(keyEntry.id)}
                            disabled={apiKeys.length <= 1} // Prevent removing the last row
                            aria-label="Remove API Key"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-8">
                <Button
                    onClick={handleAddRow}
                    disabled={!apiKeys[apiKeys.length - 1].apiKey}
                    className="rounded-full border border-solid border-transparent flex items-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-[#212121] text-gray-800 dark:text-gray-200 font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Add Another Key
                </Button>

                <Button
                    onClick={handleSave}
                    disabled={apiKeys.some(key => !key.apiKey)}
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium h-10 px-6"
                >
                    Save Keys
                </Button>
            </div>
        </div>
    );
}