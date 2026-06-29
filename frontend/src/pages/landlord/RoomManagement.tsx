import { useState } from 'react';
import { useStore, type Listing } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function RoomManagement() {
  const { currentUser, listings, updateListing, addListing } = useStore();
  const myRooms = listings.filter(room => room.landlordId === currentUser?.id);
  
  const [editingRoom, setEditingRoom] = useState<Listing | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newRoom, setNewRoom] = useState({
    title: '',
    price: 0,
    address: '',
    type: 'Studio'
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateListing(editingRoom.id, {
        title: editingRoom.title,
        price: editingRoom.price,
        status: editingRoom.status
      });
      setEditingRoom(null);
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    addListing({
      title: newRoom.title,
      price: newRoom.price,
      address: newRoom.address,
      type: newRoom.type,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
      trustScore: 100,
      status: 'Available',
      views: 0,
      leads: 0
    });
    setIsAdding(false);
    setNewRoom({ title: '', price: 0, address: '', type: 'Studio' });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500">Manage your listings, pricing, and availability.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>+ Add New Property</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myRooms.map(room => (
          <Card key={room.id} className="flex flex-col md:flex-row p-4 gap-6 items-center">
            <div className="w-full h-48 md:w-48 md:h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
              <img src={room.image} className="w-full h-full object-cover" alt="Room" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-gray-900">{room.title}</h3>
                <span className={`px-2 py-1 text-xs font-bold rounded ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {room.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{room.address}</p>
              <div className="flex gap-4 text-sm">
                <p><span className="font-medium text-gray-900">Price:</span> {room.price.toLocaleString('vi-VN')}₫/mo</p>
                <p><span className="font-medium text-gray-900">Views:</span> {room.views}</p>
                <p><span className="font-medium text-gray-900">Leads:</span> {room.leads}</p>
              </div>
            </div>
            <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <Button variant="secondary" size="sm" className="w-full" onClick={() => setEditingRoom(room)}>Edit</Button>
              <Button variant="ghost" size="sm" className="w-full text-blue-600">Promote</Button>
            </div>
          </Card>
        ))}
        {myRooms.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            You don't have any properties listed yet.
          </div>
        )}
      </div>

      {/* Edit Property Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Edit Property</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editingRoom.title}
                  onChange={e => setEditingRoom({...editingRoom, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
                <input 
                  type="number" 
                  value={editingRoom.price}
                  onChange={e => setEditingRoom({...editingRoom, price: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={editingRoom.status}
                  onChange={e => setEditingRoom({...editingRoom, status: e.target.value as 'Available' | 'Rented'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setEditingRoom(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Property Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Add New Property</h2>
            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.title}
                  onChange={e => setNewRoom({...newRoom, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Modern Studio District 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.address}
                  onChange={e => setNewRoom({...newRoom, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 123 Nguyen Trai, D1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
                  <input 
                    type="number" 
                    required
                    value={newRoom.price || ''}
                    onChange={e => setNewRoom({...newRoom, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={newRoom.type}
                    onChange={e => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Bedroom</option>
                    <option value="Shared Room">Shared Room</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Create Listing</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
