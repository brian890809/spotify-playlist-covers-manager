'use server'
import { CurrentServerUser } from "@stackframe/stack";
import { stackServerApp } from '@/stack';

const hasApiKey = (user: CurrentServerUser) => {
    const apiKeys = user?.serverMetadata?.apiKeys;
    if (apiKeys === undefined) {
        return false;
    }
    return true;
}

const checkIsOnboard = async () => {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const serverMetadata = user.serverMetadata || {};
    if (!hasApiKey(user)) {
        await user.update({ serverMetadata: {
            ...serverMetadata, 
            apiKeys: [],
         } });
    }
    await user.update({ serverMetadata: {
        ...serverMetadata,
        onboardingCompleted: true // TODO: remove this line when onboard page is ready
     } });

    // Check if the user has completed onboarding
    const onboardingCompleted = user?.serverMetadata?.onboardingCompleted || false;

    // If onboarding is not completed, return false
    if (!onboardingCompleted) {
        return false;
    }

    // If onboarding is completed, return true
    return true;
}

export default checkIsOnboard;