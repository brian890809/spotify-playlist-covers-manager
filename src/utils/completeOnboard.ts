'use server';
import { stackServerApp } from "@/stack";
// Server action to complete onboarding
async function completeOnboarding() {

    const user = await stackServerApp.getUser({ or: 'redirect' });
    const serverMetadata = user.serverMetadata || {};

    // Update user metadata to mark onboarding as completed
    await user.update({
        serverMetadata: {
            ...serverMetadata,
            onboardingCompleted: true
        }
    });

    return true;
}

export default completeOnboarding;