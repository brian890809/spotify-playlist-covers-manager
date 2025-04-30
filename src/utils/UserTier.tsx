'use server'

import { stackServerApp } from '@/stack';

const user = await stackServerApp.getUser({ or: 'redirect' });

export async function checkStatus() {
    const { subscriptionPlan } = user.serverMetadata;
    return subscriptionPlan
}

// in the future we allow users to be able to change their subscriptionPlan
