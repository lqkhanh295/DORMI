import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';

export default function TenantProfile() {
  const { currentUser, updateUser } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ');
      setFirstName(parts[0]);
      setLastName(parts.slice(1).join(' '));
    }
  }, [currentUser]);

  const [tags, setTags] = useState([
    { name: 'Quiet', active: true },
    { name: 'Non-smoker', active: true },
    { name: 'Pet-friendly', active: false },
    { name: 'Night Owl', active: true },
    { name: 'Early Bird', active: false },
    { name: 'Vegetarian', active: false },
  ]);

  const handleAddTag = () => {
    const newTag = window.prompt('Enter new lifestyle tag (e.g., Gym Lover, Student):');
    if (newTag && newTag.trim()) {
      setTags([...tags, { name: newTag.trim(), active: true }]);
    }
  };

  const toggleTag = (index: number) => {
    const newTags = [...tags];
    newTags[index].active = !newTags[index].active;
    setTags(newTags);
  };

  const handleSave = () => {
    updateUser({ name: `${firstName} ${lastName}`.trim() });
    alert('Profile saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Update your personal information and lifestyle tags.</p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden relative group cursor-pointer border-4 border-white shadow-sm">
            <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-micro">
              <span className="text-white text-sm font-medium">Edit Photo</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{currentUser?.name || 'Alex Nguyen'}</h3>
            <p className="text-sm text-gray-500">Tenant Student</p>
          </div>
          <div className="w-full pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Profile Completeness</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
              <Input label="Email" type="email" defaultValue={currentUser?.email || "alex.nguyen@example.com"} />
              <Input label="Phone Number" defaultValue="0901234567" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifestyle Tags (AI Matcher)</h3>
            <p className="text-sm text-gray-500 mb-4">Select tags that best describe your lifestyle to help AI match you with the perfect roommates.</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  onClick={() => toggleTag(index)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-micro ${
                    tag.active 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
              <span 
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-white border border-dashed border-gray-300 text-gray-500 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-50 hover:text-gray-900 transition-micro"
              >
                + Add Tag
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
