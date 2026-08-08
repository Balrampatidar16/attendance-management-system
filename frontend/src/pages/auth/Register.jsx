import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import { useRegisterMutation, useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { ROLE_HOME_PATH } from '../../utils/constants';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name || form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!form.email) next.email = 'Email is required';
    if (!form.password || form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        ...(form.department.trim() && { department: form.department.trim() }),
      }).unwrap();

      const data = await login({ email: form.email.trim(), password: form.password }).unwrap();
      dispatch(setCredentials(data));
      toast.success('Account created!');
      navigate(ROLE_HOME_PATH[data.user.role] ?? '/', { replace: true });
    } catch (err) {
      const message = err?.data?.errors?.[0]?.message ?? err?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  const isLoading = isRegistering || isLoggingIn;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create your account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          New accounts are created as employees. An admin can assign your manager afterward.
        </p>
      </div>

      <Input
        id="name"
        name="name"
        label="Full name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        autoComplete="name"
      />
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        id="department"
        name="department"
        label="Department (optional)"
        value={form.department}
        onChange={handleChange}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create account
      </Button>

      <GoogleAuthButton />

      <p className="text-sm text-center text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
          Sign in
        </Link>
      </p>
    </form>
  );
}
