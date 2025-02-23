import { Container } from "@/components";

const SignInPage = () => {
    return (
        <Container className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">Sign In</h1>
                {/* Add your custom sign-in form here */}
            </div>
        </Container>
    );
};

export default SignInPage;