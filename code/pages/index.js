import { useRouter } from 'next/router';
import GlassCard from '../components/GlassCard';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Static background with city skyline */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#0a0a2a] to-[#1a1a3a]"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(120, 120, 255, 0.2) 0%, rgba(0, 0, 0, 0) 30%), radial-gradient(circle at 70% 60%, rgba(180, 120, 255, 0.2) 0%, rgba(0, 0, 0, 0) 40%)'
          }}
        ></div>
        
        {/* City skyline silhouette */}
        <div 
          className="absolute bottom-0 left-0 w-full h-1/3 bg-contain bg-bottom bg-no-repeat" 
          style={{
            backgroundImage: 'url("/new-york-city-skyline.png")',
            maskImage: 'url("/new-york-city-skyline.png")',
            maskSize: 'contain',
            maskPosition: 'bottom',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: 'url("/new-york-city-skyline.png")',
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'bottom',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          {/* City lights overlay */}
          <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-blue-400/20 to-transparent"></div>
        </div>
      </div>
      
      <GlassCard className="max-w-2xl w-full text-center relative z-10">
        <h1 className="text-4xl font-bold text-white mb-6">Panama Smart City</h1>
        <p className="text-gray-200 mb-8">
          A smart city platform for Panama City integrated with blockchain technology and IoT sensors for realtime data collection and analysis
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          
          <button
            className="bg-accentBlue text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition"
            onClick={() => router.push('/test/dashboard')}
          >
            Water Quality Dashboard
          </button>
          
          <button
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition"
            onClick={() => router.push('/garbage-management')}
          >
            Garbage Management
          </button>
          
          <button
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition"
            onClick={() => router.push('/test/garbage-dashboard')}
          >
            Garbage Dashboard
          </button>
          
          <a
            href="https://github.com/Ayestorv/WATER"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 text-white py-3 px-6 rounded-lg hover:bg-opacity-20 transition"
          >
            GitHub Repository
          </a>
        </div>
        
        <div className="mt-12 text-sm text-gray-300">
          <p>Built with Next.js, Tailwind CSS, Nest.js, and Hardhat</p>
        </div>
      </GlassCard>
    </div>
  );
}
