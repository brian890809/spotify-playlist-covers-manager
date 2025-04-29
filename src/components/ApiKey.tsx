'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from 'lucide-react'; // Optional: for remove button icon
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
            const keys = await getApiKeys();
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
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-semibold">Manage LLM API Keys</h1>

            <div className="space-y-4">
                {apiKeys.map((keyEntry, index) => (
                    <div key={keyEntry.id} className="flex items-center space-x-2 p-4 border rounded-md">
                        <Select
                            value={keyEntry.llmType}
                            onValueChange={(value) => handleInputChange(keyEntry.id, 'llmType', value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select LLM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="perplexity">Perplexity</SelectItem>
                                <SelectItem value="claude">Claude</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            type="password" // Use password type to obscure the key
                            placeholder="Paste your API Key here"
                            value={keyEntry.apiKey}
                            onChange={(e) => handleInputChange(keyEntry.id, 'apiKey', e.target.value)}
                            className="flex-grow"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRow(keyEntry.id)}
                            disabled={apiKeys.length <= 1} // Prevent removing the last row
                            aria-label="Remove API Key"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-4">
                <Button variant="outline" disabled={!apiKeys[apiKeys.length - 1].apiKey} onClick={handleAddRow}>
                    Add Another Key
                </Button>
                <Button onClick={handleSave} disabled={apiKeys.some(key => !key.apiKey)}>
                    Save Keys
                </Button>
            </div>
        </div>
    );
}