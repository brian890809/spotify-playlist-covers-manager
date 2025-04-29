import { stackServerApp } from '@/stack';
import { ApiKeyEntry } from '@/types/types';
import { ReadonlyJson } from '@stackframe/stack-shared/dist/utils/json';

const user = await stackServerApp.getUser({ or: 'redirect' });

export async function getApiKeys() {
    const { genAiKeys } = user.serverMetadata;
    return genAiKeys || [{}]
}

export async function saveApiKeys(apiKeys: ApiKeyEntry[]) {
    const convertToReadOnly = apiKeys.map(key => ({ ...key, readonly: true }));
    await user.update({
        serverMetadata: {
            genAiKeys: convertToReadOnly as readonly ReadonlyJson[],
        },
    });
}
