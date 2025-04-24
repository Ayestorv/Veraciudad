import { useRouter } from 'next/router';
import GlassCard from '../components/GlassCard';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Water Quality Monitoring System</h1>
        <p className="text-gray-200 mb-8">
          Real-time IoT water quality monitoring with blockchain integration
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            className="bg-accentBlue text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition"
            onClick={() => router.push('/dashboard')}
          >
            View Dashboard
          </button>
          
          <a
            href="https://github.com/yourusername/water-quality-monitor"
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
