import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../features/auth/authApi';
import { updateUser } from '../../features/auth/authSlice';

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({ name, department }).unwrap();
      dispatch(updateUser(updated));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ oldPassword, newPassword }).unwrap();
      toast.success('Password changed');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.message ?? err?.data?.message ?? 'Could not change password');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account details.</p>
      </div>

      <Card title="Account details">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input label="Employee ID" value={user?.employeeId ?? ''} disabled />
          <Input label="Email" value={user?.email ?? ''} disabled />
          <Input label="Role" value={user?.role ?? ''} disabled className="capitalize" />
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Button type="submit" isLoading={isSavingProfile}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card title="Change password">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            type="password"
            label="Current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            type="password"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" isLoading={isChangingPassword}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
