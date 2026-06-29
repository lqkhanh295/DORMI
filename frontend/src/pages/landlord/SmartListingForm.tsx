import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SmartListingForm() {
  const [step, setStep] = useState(1);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const simulateAI = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Smart Listing</h1>
        <div className="flex gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-12 h-2 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <Card className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-semibold mb-4">Step 1: Basic Information</h2>
            <Input label="Property Title" placeholder="e.g. Modern Studio near University" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Monthly Rent (VND)" type="number" placeholder="5000000" />
              <Input label="Deposit (VND)" type="number" placeholder="5000000" />
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)}>Next Step</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-semibold mb-4">Step 2: Media & 3D Config</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-micro cursor-pointer">
              <div className="text-gray-500 mb-2">Drag & drop photos or 3D scan files here</div>
              <Button variant="outline" size="sm">Browse Files</Button>
            </div>
            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next Step</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Step 3: AI Review</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Our AI is analyzing your images to detect watermarks, fake photos, and optimizing your description for better SEO.
            </p>
            {aiAnalyzing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-600 font-medium">Analyzing...</p>
              </div>
            ) : (
              <Button size="lg" onClick={simulateAI}>Run AI Analysis</Button>
            )}
            <div className="pt-12 flex justify-start">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={aiAnalyzing}>Back</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-green-600 text-xl">✓</div>
              <div>
                <h3 className="font-semibold text-green-900">AI Review Passed</h3>
                <p className="text-green-700 text-sm mt-1">Your images are authentic. We generated a better title and tags for you.</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <Input label="Optimized Title" defaultValue="✨ Premium Modern Studio - 5mins to National University" />
              <div>
                <label className="text-sm font-medium text-gray-700">AI Suggested Tags</label>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Quiet Area</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Fast WiFi</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Student Friendly</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button>Publish Listing</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
