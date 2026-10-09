import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

import { GoogleSvg } from '../../assets/icons/Svgs';
import { Button } from '../ui/Button';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../contexts/AuthContext';
import { getEncryptedData } from '../../utils';
import { cookieMaxAge } from '../../utils/constants';

export default function SignInButtons() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();
  const setCookie = useCookies(['userDetails'])[1];

  const googleMutation = useMutation({
    mutationFn: (code: string) => axios.post('/auth/google', { code }),
  });

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      const toastId = toast.loading('Signing you in...');
      googleMutation.mutate(code, {
        onSuccess: res => {
          setAuth({ accessToken: res.data.accessToken, ...res.data.data.user });
          setCookie('userDetails', getEncryptedData(res.data.data.user), {
            path: '/',
            maxAge: cookieMaxAge,
          });
          toast.success('Signed in successfully', { id: toastId });
          navigate(searchParams.get('callbackUrl') ?? '/', { replace: true });
        },
        onError: () => toast.error('Something went wrong!', { id: toastId }),
      });
    },
    onError: () => toast.error('Google sign-in failed!'),
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full gap-3 text-base"
      isLoading={googleMutation.isPending}
      onClick={() => googleLogin()}
    >
      <GoogleSvg className="h-5 w-5" />
      Sign in with Google
    </Button>
  );
}
