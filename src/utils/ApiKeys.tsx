'use server'

import { stackServerApp } from '@/stack';
import { ApiKeyEntry } from '@/types/types';
import { ReadonlyJson } from '@stackframe/stack-shared/dist/utils/json';


export async function getApiKeys() {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const { genAiKeys } = user.serverMetadata || {};
    return genAiKeys || [{}]
}

export async function saveApiKeys(apiKeys: ApiKeyEntry[]) {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const convertToReadOnly: ReadonlyJson[] = apiKeys.map(key => ({ ...key }));
    await user.update({
        serverMetadata: {
            genAiKeys: convertToReadOnly,
        },
    });
}
