'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, RotateCcw } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ApiKeyEntry } from '@/types/types';

export default function ApiKey({ apiKeys: fetchedKeys, saveKey }: { apiKeys: ApiKeyEntry[]; saveKey: (apiKeys: ApiKeyEntry[]) => Promise<void> }) {
    const [existingKeys, setExistingKeys] = useState<(ApiKeyEntry & { markedForDeletion?: boolean })[]>(
        fetchedKeys?.map(key => ({ ...key, markedForDeletion: false })) || []
    );
    const [newKeys, setNewKeys] = useState<ApiKeyEntry[]>([{ id: crypto.randomUUID(), llmType: '', apiKey: '' }]);

    const handleMarkForDeletion = (id: string, mark: boolean) => {
        setExistingKeys(prevKeys =>
            prevKeys.map(key =>
                key.id === id ? { ...key, markedForDeletion: mark } : key
            )
        );
    };

    const handleNewKeyChange = (id: string, field: keyof Omit<ApiKeyEntry, 'id'>, value: string) => {
        setNewKeys(prevKeys =>
            prevKeys.map(key =>
                key.id === id ? { ...key, [field]: value } : key
            )
        );

        // Check if this was the last key and it's now filled
        const keyIndex = newKeys.findIndex(key => key.id === id);
        const key = newKeys[keyIndex];

        if (keyIndex === newKeys.length - 1 && key.llmType && key.apiKey && (field === 'llmType' || field === 'apiKey')) {
            // Add a new empty key input
            setNewKeys(prevKeys => [...prevKeys, { id: crypto.randomUUID(), llmType: '', apiKey: '' }]);
        }
    };

    const handleRemoveNewKey = (id: string) => {
        // Don't remove if it's the only empty key left
        if (newKeys.length === 1 && !newKeys[0].llmType && !newKeys[0].apiKey) {
            return;
        }

        setNewKeys(prevKeys => {
            const filteredKeys = prevKeys.filter(key => key.id !== id);

            // If we removed the last key and there are no empty keys, add an empty one
            if (filteredKeys.length === 0 || filteredKeys.every(key => key.llmType && key.apiKey)) {
                return [...filteredKeys, { id: crypto.randomUUID(), llmType: '', apiKey: '' }];
            }

            return filteredKeys;
        });
    };

    const handleSave = async () => {
        // Filter out empty new keys
        const validNewKeys = newKeys.filter(key => key.llmType && key.apiKey);

        // Keep only existing keys that are not marked for deletion
        const remainingExistingKeys = existingKeys
            .filter(key => !key.markedForDeletion)
            .map(({ markedForDeletion, ...key }) => key); // Remove the markedForDeletion property

        const allKeys = [...remainingExistingKeys, ...validNewKeys];

        await saveKey(allKeys);

        // Update state after save
        setExistingKeys(allKeys.map(key => ({ ...key, markedForDeletion: false })));
        setNewKeys([{ id: crypto.randomUUID(), llmType: '', apiKey: '' }]);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300">
            <h1 className="text-3xl font-bold mb-6">Manage Your <span className="text-[#1DB954]">LLM API</span> Keys</h1>

            {/* Existing Keys Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Keys</h2>
                {existingKeys.length > 0 ? (
                    <div className="grid gap-1">
                        <div className="grid grid-cols-2 gap-4 text-lg font-medium">
                            <div>Provider</div>
                            <div>Key</div>
                        </div>
                        {existingKeys.map((keyEntry) => (
                            <div
                                key={keyEntry.id}
                                className={`grid grid-cols-2 gap-4 items-center ${keyEntry.markedForDeletion
                                    ? 'opacity-60'
                                    : ''
                                    }`}
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled
                                        value={keyEntry.llmType}
                                        className="w-full p-1 border border-none rounded-lg bg-white dark:bg-[#212121] focus:outline-none"
                                        placeholder="e.g. CLIENT_KEY"
                                    />
                                </div>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        disabled
                                        value={keyEntry.apiKey}
                                        className="w-full p-1 border border-none rounded-lg bg-white dark:bg-[#212121] focus:outline-none"
                                    />
                                    {keyEntry.markedForDeletion ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMarkForDeletion(keyEntry.id, false)}
                                            aria-label="Undo Delete"
                                            className="absolute right-2 text-[#1DB954] hover:text-[#1ed760]"
                                        >
                                            <RotateCcw className="h-5 w-5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMarkForDeletion(keyEntry.id, true)}
                                            aria-label="Mark for Deletion"
                                            className="absolute right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-5 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-sm text-center">
                        <p className="text-gray-500 dark:text-gray-400">You don't have any saved API keys yet. Add new keys below.</p>
                    </div>
                )}
            </div>

            {/* Add New Key Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Add New Keys</h2>
                {newKeys.map((keyEntry, index) => (
                    <div key={keyEntry.id} className="flex items-center space-x-3 p-5 bg-gray-100 dark:bg-[#181818] rounded-lg shadow-sm">
                        <Select
                            value={keyEntry.llmType}
                            onValueChange={(value) => handleNewKeyChange(keyEntry.id, 'llmType', value)}
                        >
                            <SelectTrigger className="w-[180px] border-gray-300 dark:border-gray-700 bg-white dark:bg-[#212121] dark:hover:bg-[#3d3d3d]">
                                <SelectValue placeholder="Select LLM" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#212121] dark:text-gray-200">
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="claude">Claude</SelectItem>
                                <SelectItem value="freepik">Freepik</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Paste your API Key here"
                            value={keyEntry.apiKey}
                            onChange={(e) => handleNewKeyChange(keyEntry.id, 'apiKey', e.target.value)}
                            className="flex-grow border-gray-300 dark:border-gray-700 bg-white dark:bg-[#212121] focus-visible:ring-[#1DB954]"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveNewKey(keyEntry.id)}
                            aria-label="Remove API Key"
                            disabled={newKeys.length === 1 && !keyEntry.llmType && !keyEntry.apiKey}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex justify-end items-center mt-8">
                <Button
                    onClick={handleSave}
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium h-10 px-6"
                >
                    Save Keys
                </Button>
            </div>
        </div>
    );
}