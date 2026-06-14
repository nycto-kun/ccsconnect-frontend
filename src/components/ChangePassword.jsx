import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../utils/api';
import { toast } from 'sonner';

const ChangePassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/change-password', null, {
    params: { 
    old_password: oldPassword, 
    new_password: newPassword 
  }
});
      toast.success('Password changed successfully!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Password change failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-md dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-500" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Current Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="pl-10 pr-10"
                required
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-3 text-gray-400">
                {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-700 dark:text-gray-300">New Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="pl-10 pr-10"
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-gray-400">
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Confirm New Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pl-10 pr-10"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-400">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white">
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;