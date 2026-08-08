import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { useGoogleAuthMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { ROLE_HOME_PATH } from '../../utils/constants';

// Single "Continue with Google" entry point used on both Login and Register — Google identity
// verification always resolves to the same find-or-create-and-link flow on the backend, so there
// is nothing page-specific here.
export default function GoogleAuthButton() {
  const [googleAuth] = useGoogleAuthMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google sign-in did not return a valid credential. Please try again.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await googleAuth({ idToken: credentialResponse.credential }).unwrap();
      dispatch(setCredentials(data));
      toast.success('Signed in with Google');
      const redirectTo = location.state?.from?.pathname ?? ROLE_HOME_PATH[data.user.role] ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err?.data?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
        <span className="mx-3 text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Or</span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
      </div>

      {isSubmitting ? (
        <Button type="button" variant="secondary" className="w-full" isLoading disabled>
          Signing you in...
        </Button>
      ) : (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Google sign-in was cancelled or failed. Please try again.')}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            width="336"
            logo_alignment="left"
          />
        </div>
      )}
    </div>
  );
}
