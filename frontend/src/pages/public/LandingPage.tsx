import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center bg-blue-50">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Find your perfect <span className="text-blue-600">room</span> & <span className="text-blue-600">roommate</span>.
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Dormi uses AI to match you with compatible roommates and verifies every listing with a Smart Trust Score.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/search"><Button size="lg">Explore Rooms</Button></Link>
          <Link to="/tenant/match"><Button variant="outline" size="lg">Find Roommates</Button></Link>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-card col-span-1 md:col-span-2">
            <h3 className="text-2xl font-semibold mb-2">Smart AI Matching</h3>
            <p className="text-gray-500">Our recommendation engine analyzes lifestyle tags to find your ideal roommate match.</p>
          </div>
          <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-card">
            <h3 className="text-2xl font-semibold mb-2">3D Virtual Tours</h3>
            <p className="text-blue-100">Step inside your new home before you even visit.</p>
          </div>
          <div className="bg-green-50 p-8 rounded-2xl shadow-card">
            <h3 className="text-2xl font-semibold text-green-900 mb-2">Verified Trust Score</h3>
            <p className="text-green-700">Every landlord is verified to protect you from scams.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-card col-span-1 md:col-span-2 border border-gray-100">
            <h3 className="text-2xl font-semibold mb-2">Zero Hassle Booking</h3>
            <p className="text-gray-500">Schedule viewings, chat with landlords, and secure your room all in one place.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
