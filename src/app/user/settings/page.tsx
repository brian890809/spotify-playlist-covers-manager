import { AccountSettings } from '@stackframe/stack';
import ApiKey from '@/components/ApiKey';

export default function MyAccountPage() {
    return (
        <AccountSettings
            fullPage={true}
            extraItems={[{
                id: 'api-key',
                title: 'Your API Key',
                iconName: "KeyRound",
                content: <ApiKey />,
            }]}
        />
    );
}