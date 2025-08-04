'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface FounderAvatar {
  name: string;
  url: string;
  socialLink: string;
}

export function TrustedBy() {
  const [founderAvatars, setFounderAvatars] = useState<FounderAvatar[]>([]);

  useEffect(() => {
    // Try to load founder avatars with different formats
    const loadFounderAvatars = async () => {
      const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/founder`;
      const socialLinks = [
        'https://x.com/AdityaShips',
        'https://peerlist.io/bebdyshev',
        'https://x.com/tanmay7_',
        'https://x.com/ajpicard928'
      ];
      const avatars: FounderAvatar[] = [];
      
      for (let i = 1; i <= 4; i++) {
        // Try different formats: jpg, png
        const formats = ['jpg', 'png'];
        let avatarUrl = '';
        
        for (const format of formats) {
          const testUrl = `${baseUrl}/founder_${i}.${format}`;
          try {
            const response = await fetch(testUrl, { method: 'HEAD' });
            if (response.ok) {
              avatarUrl = testUrl;
              break;
            }
          } catch {
            continue;
          }
        }
        
        if (avatarUrl) {
          avatars.push({ 
            name: `founder_${i}`, 
            url: avatarUrl,
            socialLink: socialLinks[i - 1]
          });
        }
      }
      
      setFounderAvatars(avatars);
    };

    loadFounderAvatars();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex flex-col items-center space-y-4 animate-fadeInUp animate-delay-700">
        {/* Founder Avatars with Inline Trust Text */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex -space-x-2">
            {founderAvatars.length > 0 ? (
              founderAvatars.map((founder, index) => (
                <a
                  key={founder.name}
                  href={founder.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer"
                  style={{
                    animation: `scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${(index + 1) * 0.1}s both`
                  }}
                >
                  <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg hover:shadow-xl overflow-hidden bg-gray-100 transition-shadow duration-300">
                    <Image
                      src={founder.url}
                      alt={`Trusted founder ${index + 1}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/me.jpg';
                      }}
                    />
                  </div>
                </a>
              ))
            ) : (
              // Fallback avatars if founder images are not available
              Array.from({ length: 4 }, (_, index) => {
                const socialLinks = [
                  'https://x.com/AdityaShips',
                  'https://peerlist.io/bebdyshev',
                  'https://x.com/tanmay7_',
                  'https://x.com/ajpicard928'
                ];
                
                return (
                  <a
                    key={`fallback-${index}`}
                    href={socialLinks[index]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer"
                    style={{
                      animation: `scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${(index + 1) * 0.1}s both`
                    }}
                  >
                    <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg hover:shadow-xl overflow-hidden bg-gray-100 transition-shadow duration-300">
                      <Image
                        src="/me.jpg"
                        alt={`Trusted founder ${index + 1}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </a>
                );
              })
            )}
          </div>
          
          {/* Trust text with plus indicator */}
          <div className="flex items-center space-x-2 animate-fadeIn animate-delay-1000">
            <span className="text-sm font-medium text-gray-700">Trusted by</span>
            <div className="bg-gray-100 rounded-full px-3 py-1">
              <span className="text-sm font-semibold text-gray-800">+8 founders</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}