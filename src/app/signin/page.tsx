import { OAuthButton } from "@stackframe/stack";

export default function CustomSignInPage() {
    return (
        <div>
            <h1>My Custom Sign In page</h1>
            <OAuthButton provider="spotify" type="sign-in" />
        </div>
    );
}
