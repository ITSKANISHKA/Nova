import { useState, useEffect } from 'react';
import { adminApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi.getUsers().then(({ data }) => setUsers(data.users)).catch(() => toast.error('Could not load users')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.toggleUserStatus(id);
      setUsers(users.map((u) => (u._id === id ? data.user : u)));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Could not update user status');
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Manage Users</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-ink/10">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-ink/50">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {u.role !== 'admin' && (
                    <button onClick={() => handleToggle(u._id)} className="text-xs text-teal font-medium">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
