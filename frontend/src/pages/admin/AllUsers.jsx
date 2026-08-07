import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/common/SearchBar';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from '../../features/users/userApi';
import { ROLES } from '../../utils/constants';

const ROLE_OPTIONS = [
  { value: ROLES.EMPLOYEE, label: 'Employee' },
  { value: ROLES.MANAGER, label: 'Manager' },
  { value: ROLES.ADMIN, label: 'Admin' },
];

export default function AllUsers() {
  const [filters, setFilters] = useState({ role: '', isActive: '', search: '', page: 1 });
  const [editUser, setEditUser] = useState(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    role: filters.role || undefined,
    isActive: filters.isActive || undefined,
    search: filters.search || undefined,
    page: filters.page,
    limit: 10,
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const handleFilterChange = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  const handleDeactivate = async (user) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Deactivate ${user.name}? They will no longer be able to sign in.`)) return;
    try {
      await deactivateUser(user._id).unwrap();
      toast.success('User deactivated');
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not deactivate user');
    }
  };

  const handleSave = async (payload) => {
    try {
      await updateUser({ id: editUser._id, ...payload }).unwrap();
      toast.success('User updated');
      setEditUser(null);
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not update user');
    }
  };

  const columns = [
    { key: 'employeeId', header: 'ID', render: (row) => row.employeeId },
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'role', header: 'Role', render: (row) => <Badge tone="slate">{row.role}</Badge> },
    { key: 'department', header: 'Department', render: (row) => row.department || '-' },
    { key: 'manager', header: 'Manager', render: (row) => row.manager?.name ?? '-' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (row.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Inactive</Badge>),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditUser(row)}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
          >
            Edit
          </button>
          {row.isActive && (
            <button
              type="button"
              onClick={() => handleDeactivate(row)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium"
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">All Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage roles, departments, and manager assignments.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <SearchBar
            value={filters.search}
            onChange={(search) => handleFilterChange({ search })}
            placeholder="Search name, email, or ID…"
          />
          <div className="flex gap-3">
            <Select
              label="Role"
              placeholder="All roles"
              value={filters.role}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
              options={ROLE_OPTIONS}
              className="max-w-[9rem]"
            />
            <Select
              label="Status"
              placeholder="All"
              value={filters.isActive}
              onChange={(e) => handleFilterChange({ isActive: e.target.value })}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              className="max-w-[8rem]"
            />
          </div>
        </div>

        <Table columns={columns} data={data?.items ?? []} isLoading={isLoading || isFetching} />

        <Pagination
          page={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      </Card>

      <EditUserModal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        onSave={handleSave}
        isSaving={isUpdating}
      />
    </div>
  );
}

function EditUserModal({ open, onClose, user, onSave, isSaving }) {
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [department, setDepartment] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [manager, setManager] = useState('');

  const { data: managersData } = useGetUsersQuery({ role: ROLES.MANAGER, limit: 100 }, { skip: !open });

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setDepartment(user.department ?? '');
      setIsActive(user.isActive);
      setManager(user.manager?._id ?? user.manager ?? '');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { role, department, isActive };
    if (role === ROLES.EMPLOYEE) {
      payload.manager = manager || null;
    }
    onSave(payload);
  };

  if (!user) return null;

  const managerOptions = (managersData?.items ?? []).map((m) => ({ value: m._id, label: m.name }));

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
        <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        {role === ROLES.EMPLOYEE && (
          <Select
            label="Manager"
            placeholder="No manager assigned"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            options={managerOptions}
          />
        )}
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700"
          />
          Active
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
