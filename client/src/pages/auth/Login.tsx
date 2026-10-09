import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/Card';
import SignInButtons from '../../components/auth/SignInButtons';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import useTitle from '../../hooks/useTitle';

export default function Login() {
  const { setPersist } = useAuth();
  useTitle('Sign In | Easy Quick Form');

  // Keep users signed in across reloads (refresh-token based).
  useEffect(() => {
    setPersist(true);
    localStorage.setItem('persist', 'true');
  }, [setPersist]);

  return (
    <Card className="text-center">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="font-cursive text-4xl text-primary">
          Easy Quick Form
        </CardTitle>
        <CardDescription>
          Build drag-and-drop forms and track their responses in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        {GOOGLE_CLIENT_ID ? (
          <SignInButtons />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sign-in is not configured: set VITE_GOOGLE_CLIENT_ID.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
