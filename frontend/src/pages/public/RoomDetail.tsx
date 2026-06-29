import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function RoomDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Image Gallery Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
        <div className="md:col-span-2 h-full bg-gray-200 rounded-2xl overflow-hidden relative group">
          <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" alt="Room Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-micro">
            <Button className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur">
              Launch 3D Tour
            </Button>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="flex-1 bg-gray-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80" alt="Room 2" className="w-full h-full object-cover" /></div>
          <div className="flex-1 bg-gray-200 rounded-2xl overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80" alt="Room 3" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
              <span className="text-white font-bold">+12 Photos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Modern Studio - District 3</h1>
              <div className="flex flex-col items-end">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  ✓ Verified Landlord
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-lg">123 Nguyen Dinh Chieu, Vo Thi Sau Ward, District 3, HCMC</p>
          </div>

          <div className="flex gap-6 py-6 border-y border-gray-200">
            <div><p className="text-gray-500 text-sm">Room Type</p><p className="font-semibold text-gray-900">Studio</p></div>
            <div><p className="text-gray-500 text-sm">Capacity</p><p className="font-semibold text-gray-900">2 People</p></div>
            <div><p className="text-gray-500 text-sm">Area</p><p className="font-semibold text-gray-900">35 m²</p></div>
            <div><p className="text-gray-500 text-sm">Bathroom</p><p className="font-semibold text-gray-900">Private</p></div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              Fully furnished modern studio located in the heart of District 3. Very close to universities, convenience stores, and coffee shops. The building has a 24/7 security guard, fingerprint access, and a free rooftop washing machine.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="p-6 sticky top-24">
            <div className="mb-6">
              <p className="text-3xl font-bold text-blue-600">5.500.000₫ <span className="text-base text-gray-500 font-normal">/ month</span></p>
              <p className="text-sm text-gray-500 mt-2">Deposit: 5.500.000₫</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <Button fullWidth size="lg">Schedule Viewing</Button>
              <Button fullWidth variant="outline" size="lg">Chat with Landlord</Button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">L</div>
                <div>
                  <p className="font-bold text-gray-900">Le Van B</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">★ 4.9 (12 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Trust Score</span>
                <span className="font-bold text-green-600">98/100</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
