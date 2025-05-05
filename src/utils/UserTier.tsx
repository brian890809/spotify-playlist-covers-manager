'use server'

import { stackServerApp } from '@/stack';


export async function checkStatus() {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const { subscriptionPlan } = user.serverMetadata;
    return subscriptionPlan
}

// in the future we allow users to be able to change their subscriptionPlan
