import { useState } from 'react';
import { useStore, type Listing } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function RoomManagement() {
  const { currentUser, listings, updateListing } = useStore();
  const myRooms = listings.filter(room => room.landlordId === currentUser?.id);
  
  const [editingRoom, setEditingRoom] = useState<Listing | null>(null);

  const handleSave = (e: React.FormEvent) => {
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

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500">Manage your listings, pricing, and availability.</p>
        </div>
        <Button>+ Add New Property</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myRooms.map(room => (
          <Card key={room.id} className="flex flex-col md:flex-row p-4 gap-6 items-center">
            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
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

      {editingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Edit Property</h2>
            <form onSubmit={handleSave} className="space-y-4">
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
    </div>
  );
}
