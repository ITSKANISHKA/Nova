import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Your Profile</h1>
      <p className="text-sm text-ink/50 mb-6">{user?.email} · <span className="capitalize">{user?.role}</span></p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Name</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Phone</label>
          <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Street</label>
          <input className="input-field" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1">City</label>
            <input className="input-field" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">State</label>
            <input className="input-field" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Pincode</label>
          <input className="input-field" value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
