/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기본 설정
  reactStrictMode: true,
  
  // 접근성 경고 억제 - 이는 개발 도구에서만 적용됨
  eslint: {
    // 기존 ESLint 설정은 유지하면서 경고만 조정
    ignoreDuringBuilds: true,
  },
  
  // Webpack 설정을 통해 특정 경고 메시지를 필터링
  webpack: (config, { dev, isServer }) => {
    // 개발 환경에서만 적용
    if (dev) {
      // 원본 설정을 변경하지 않고 새 설정 반환
      return {
        ...config,
        ignoreWarnings: [
          // Radix UI 접근성 경고 억제
          { message: /DialogContent.*DialogTitle.*accessibility/i }
        ]
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
