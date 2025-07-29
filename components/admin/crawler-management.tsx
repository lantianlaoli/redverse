'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, PlayCircle, RefreshCw, AlertCircle, CheckCircle, Clock, LogIn } from 'lucide-react';
import Image from 'next/image';

interface CrawlerStats {
  total: number;
  withUrl: number;
  crawled: number;
  uncrawled: number;
}

interface LoginStatus {
  isLoggedIn: boolean;
  lastChecked: string;
  cookiesExpireAt?: string;
  error?: string;
}

interface CrawlResult {
  total: number;
  success: number;
  failed: number;
}

export function CrawlerManagement() {
  const [stats, setStats] = useState<CrawlerStats | null>(null);
  const [loginStatus, setLoginStatus] = useState<LoginStatus | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);

  const CRAWLER_API_BASE = process.env.NEXT_PUBLIC_CRAWLER_API_URL || 'http://localhost:3001/api/v1';

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/data/statistics`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [CRAWLER_API_BASE]);

  const loadLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/auth/status`);
      const data = await response.json();
      if (data.success) {
        setLoginStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to load login status:', error);
    }
  }, [CRAWLER_API_BASE]);

  useEffect(() => {
    loadStats();
    loadLoginStatus();
  }, [loadStats, loadLoginStatus]);

  const startLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/auth/login`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setQrCodeImage(data.data.qrCodeBase64);
        // 开始轮询登录状态
        pollLoginStatus();
      } else {
        alert('Failed to start login: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to start login:', error);
      alert('Failed to start login process');
    } finally {
      setIsLoading(false);
    }
  };

  const pollLoginStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${CRAWLER_API_BASE}/auth/check`, {
          method: 'POST',
        });
        const data = await response.json();
        
        if (data.success && data.data.isLoggedIn) {
          setQrCodeImage(null);
          setLoginStatus({ isLoggedIn: true, lastChecked: new Date().toISOString() });
          clearInterval(interval);
          alert('Login successful!');
        }
      } catch (error) {
        console.error('Failed to check login status:', error);
      }
    }, 3000);

    // 清理定时器
    setTimeout(() => clearInterval(interval), 60000);
  };

  const startCrawling = async (limit: number = 5) => {
    setIsLoading(true);
    setCrawlResult(null);
    
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/data/crawl-batch?limit=${limit}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setCrawlResult(data.data);
        loadStats(); // 刷新统计
      } else {
        alert('Failed to start crawling: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to start crawling:', error);
      alert('Failed to start crawling process');
    } finally {
      setIsLoading(false);
    }
  };

  const resetNotesForRecrawl = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/data/reset-for-recrawl`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        loadStats();
      } else {
        alert('Failed to reset: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to reset:', error);
      alert('Failed to reset notes for recrawl');
    } finally {
      setIsLoading(false);
    }
  };

  const forceRelogin = async () => {
    if (!confirm('Are you sure you want to clear the login status? You will need to scan QR code again.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/auth/force-relogin`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setQrCodeImage(null);
        loadLoginStatus();
      } else {
        alert('Failed to force relogin: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to force relogin:', error);
      alert('Failed to force relogin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Xiaohongshu Crawler Management</h1>
      </div>

      {/* Login Status Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Login Status</h2>
        
        {loginStatus && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-3">
              {loginStatus.isLoggedIn ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Logged in to Xiaohongshu</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Not logged in</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Last checked: {new Date(loginStatus.lastChecked).toLocaleString()}</div>
              {loginStatus.isLoggedIn && loginStatus.cookiesExpireAt && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Cookies expire: {new Date(loginStatus.cookiesExpireAt).toLocaleString()}</span>
                </div>
              )}
              {loginStatus.error && (
                <div className="text-red-600">Error: {loginStatus.error}</div>
              )}
            </div>
          </div>
        )}

        {qrCodeImage && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-3">Scan QR code with Xiaohongshu app to login:</p>
            <Image 
              src={`data:image/png;base64,${qrCodeImage}`} 
              alt="QR Code" 
              width={200}
              height={200}
              className="mx-auto border"
            />
            <p className="text-xs text-gray-500 mt-2">QR code will expire in 60 seconds</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={startLogin}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Starting...' : 'Start Login Process'}</span>
          </button>
          
          <button
            onClick={loadLoginStatus}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
          
          {loginStatus?.isLoggedIn && (
            <button
              onClick={forceRelogin}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>Force Re-login</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crawling Statistics</h2>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Notes</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.withUrl}</div>
              <div className="text-sm text-gray-600">With URL</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.crawled}</div>
              <div className="text-sm text-gray-600">Crawled</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.uncrawled}</div>
              <div className="text-sm text-gray-600">Uncrawled</div>
            </div>
          </div>
        )}

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Statistics</span>
        </button>
      </div>

      {/* Crawling Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crawling Controls</h2>
        
        {crawlResult && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Last Crawl Result:</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>Total: {crawlResult.total}</div>
              <div className="text-green-600">Success: {crawlResult.success}</div>
              <div className="text-red-600">Failed: {crawlResult.failed}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Start Crawling</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => startCrawling(5)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Crawl 5 Notes</span>
              </button>
              <button
                onClick={() => startCrawling(10)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Crawl 10 Notes</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Reset Tasks</h3>
            <div className="flex space-x-2">
              <button
                onClick={resetNotesForRecrawl}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset for Re-crawl</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Clock className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600">Processing...</span>
        </div>
      )}
    </div>
  );
}