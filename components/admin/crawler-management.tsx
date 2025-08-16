'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, RefreshCw, AlertCircle, CheckCircle, Clock, Smartphone, BarChart3, Activity } from 'lucide-react';

interface LoginStatus {
  loginStatus: 'idle' | 'logging_in' | 'waiting_sms_code' | 'logged_in' | 'failed';
  updateStatus: 'idle' | 'updating' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    failed: number;
  };
  lastUpdate?: string;
  error?: string;
}

export function CrawlerManagement() {
  const [loginStatus, setLoginStatus] = useState<LoginStatus | null>(null);
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '13800138000';
  const [phoneNumber, setPhoneNumber] = useState(adminPhone);
  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const smsInProgressRef = useRef<boolean>(false);
  const isPollingRef = useRef<boolean>(false);
  const startProgressPollingRef = useRef<(() => void) | null>(null);
  const generalPollingRef = useRef<NodeJS.Timeout | null>(null);

  const CRAWLER_API_BASE = process.env.NEXT_PUBLIC_CRAWLER_API_URL || 'http://localhost:3000';

  // Mask phone number for privacy
  const maskPhoneNumber = (phone: string) => {
    if (phone.length >= 11) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return phone;
  };

  const loadLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/progress`);
      const data = await response.json();
      
      if (data.success) {
        setLoginStatus(prevStatus => {
          // Only update state when data actually changes
          if (JSON.stringify(prevStatus) !== JSON.stringify(data.data)) {
            console.log('🔄 [Debug] Status data changed, updating UI:', {
              updateStatus: data.data?.updateStatus,
              progress: data.data?.progress,
              timestamp: new Date().toLocaleTimeString()
            });
            return data.data;
          }
          return prevStatus;
        });
        
        // Reset SMS process flag when login succeeds
        if (data.data.loginStatus === 'logged_in') {
          smsInProgressRef.current = false;
        }
      }
    } catch (error) {
      console.error('Failed to load login status:', error);
    }
  }, [CRAWLER_API_BASE]);

  // General status polling - continuously check status after page entry
  const startGeneralPolling = useCallback(() => {
    if (generalPollingRef.current) return; // Prevent duplicate startup
    
    console.log('🔄 [Debug] Starting general status polling...');
    generalPollingRef.current = setInterval(() => {
      console.log('🔄 [Debug] General polling - requesting status...');
      loadLoginStatus();
    }, 5000); // Check status every 5 seconds
  }, [loadLoginStatus]);

  // Stop general polling
  const stopGeneralPolling = useCallback(() => {
    if (generalPollingRef.current) {
      clearInterval(generalPollingRef.current);
      generalPollingRef.current = null;
      console.log('🛑 [Debug] Stopped general status polling');
    }
  }, []);

  // Initialize loading status, remove dependencies to avoid loops
  useEffect(() => {
    const initLoad = async () => {
      try {
        console.log('🔄 [Debug] Initial load - requesting status...');
        const response = await fetch(`${CRAWLER_API_BASE}/progress`);
        const data = await response.json();
        
        if (data.success) {
          setLoginStatus(data.data);
          console.log('🔄 [Debug] Initial status loaded:', data.data);
        }
      } catch (error) {
        console.error('Failed to load initial status:', error);
      }
    };
    
    initLoad();
    // 启动通用轮询
    startGeneralPolling();
    
    // 组件卸载时清理
    return () => {
      stopGeneralPolling();
    };
  }, [CRAWLER_API_BASE, startGeneralPolling, stopGeneralPolling]); // 只依赖API地址和轮询函数

  // 停止轮询
  const stopProgressPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
  }, []);

  // 开始轮询状态更新
  const startProgressPolling = useCallback(() => {
    if (isPollingRef.current || pollIntervalRef.current) return; // 防止重复轮询
    
    console.log('🔄 [Debug] Starting progress polling...');
    isPollingRef.current = true;
    setIsPolling(true);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${CRAWLER_API_BASE}/progress`);
        const data = await response.json();
        
        if (data.success) {
          setLoginStatus(prevStatus => {
            // 只有在数据真的发生变化时才更新状态，避免无意义的重新渲染
            const hasChanged = JSON.stringify(prevStatus) !== JSON.stringify(data.data);
            if (hasChanged) {
              console.log('🔄 [Debug] Polling detected change:', {
                updateStatus: data.data?.updateStatus,
                progress: data.data?.progress,
                timestamp: new Date().toLocaleTimeString()
              });
              return data.data;
            }
            return prevStatus;
          });
          
          // 如果更新完成或失败，停止轮询
          if (data.data.updateStatus === 'completed' || data.data.updateStatus === 'failed') {
            console.log('🛑 [Debug] Stopping polling due to status:', data.data.updateStatus);
            stopProgressPolling();
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 3000); // 改为每3秒轮询一次，更快响应

    // 设置最大轮询时间（10分钟）
    pollTimeoutRef.current = setTimeout(() => {
      console.log('🛑 [Debug] Stopping polling due to timeout');
      stopProgressPolling();
    }, 600000);
  }, [CRAWLER_API_BASE, stopProgressPolling]);

  // 更新 ref 指向最新的函数
  useEffect(() => {
    startProgressPollingRef.current = startProgressPolling;
  }, [startProgressPolling]);

  // 监听登录状态变化，自动开始轮询
  useEffect(() => {
    if (loginStatus?.loginStatus === 'logged_in' && loginStatus?.updateStatus === 'updating') {
      startProgressPollingRef.current?.();
    }
  }, [loginStatus?.loginStatus, loginStatus?.updateStatus]);

  // 这个 useEffect 已经合并到初始化 useEffect 中了

  const startPhoneLogin = async () => {
    if (!phoneNumber) {
      alert('Please enter phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/auth/phone-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      
      if (data.success) {
        smsInProgressRef.current = true;
        console.log('🔄 [Debug] SMS sent successfully');
        // 立即加载状态，界面会自动切换到SMS输入
        // 通用轮询会继续运行，不需要额外启动
        loadLoginStatus();
      } else {
        smsInProgressRef.current = false; // 发送失败时重置标志
        console.error('Failed to send SMS:', data.message);
      }
    } catch (error) {
      smsInProgressRef.current = false; // 异常时重置标志
      console.error('Failed to start phone login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSmsCode = async () => {
    if (!smsCode) {
      alert('Please enter SMS code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/auth/submit-sms-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ smsCode }),
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('SMS code submitted successfully, waiting for verification...');
        smsInProgressRef.current = false; // 重置SMS进程标志
        // 清空SMS码和手机号
        setSmsCode('');
        setPhoneNumber('');
        // 立即加载状态，通用轮询会持续检查状态变化
        loadLoginStatus();
        console.log('🔄 [Debug] SMS verification submitted, general polling will handle status updates');
      } else {
        smsInProgressRef.current = false; // 提交失败时也重置标志
        console.error('Failed to submit SMS code:', data.message);
      }
    } catch (error) {
      smsInProgressRef.current = false; // 异常时也重置标志
      console.error('Failed to submit SMS code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/progress/clear`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Progress data cleared successfully');
        // 重置所有本地状态
        setLoginStatus(null);
        setSmsCode('');
        smsInProgressRef.current = false;
        stopProgressPolling();
        stopGeneralPolling();
        
        // 重新启动通用轮询和加载状态
        setTimeout(() => {
          loadLoginStatus();
          startGeneralPolling();
        }, 500);
      } else {
        console.error('Failed to clear progress data:', data.message);
      }
    } catch (error) {
      console.error('Failed to clear progress data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [CRAWLER_API_BASE, stopProgressPolling, stopGeneralPolling, loadLoginStatus, startGeneralPolling]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-gray-700" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Xiaohongshu Crawler</h1>
            <p className="text-sm text-gray-600 mt-1">Automated data collection and monitoring</p>
          </div>
        </div>
        {/* Status Monitor & Manual Refresh */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-gray-700 mb-1">Current Status Monitor:</div>
              <div className="font-mono text-gray-600 whitespace-pre-wrap">
                {loginStatus ? JSON.stringify(loginStatus, null, 2) : 'Loading...'}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={loadLoginStatus}
                disabled={isLoading}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh Now'}
              </button>
              <div className="text-xs text-gray-500">
                Auto-refresh: 5s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Status Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Authentication Status</h2>
        
          {loginStatus && (
            <div className="border border-gray-200 rounded p-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {loginStatus.loginStatus === 'logged_in' ? (
                    <CheckCircle className="w-5 h-5 text-gray-700" />
                  ) : loginStatus.loginStatus === 'waiting_sms_code' ? (
                    <Clock className="w-5 h-5 text-gray-700" />
                  ) : loginStatus.loginStatus === 'logging_in' ? (
                    <RefreshCw className="w-5 h-5 text-gray-700 animate-spin" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {loginStatus.loginStatus === 'logged_in' ? 'Connected' :
                     loginStatus.loginStatus === 'waiting_sms_code' ? 'Awaiting SMS Code' :
                     loginStatus.loginStatus === 'logging_in' ? 'Connecting...' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {loginStatus.loginStatus === 'logged_in' ? 'Ready to collect data' :
                     loginStatus.loginStatus === 'waiting_sms_code' ? 'Enter verification code below' :
                     loginStatus.loginStatus === 'logging_in' ? 'Please wait...' : 'Authentication required'}
                  </p>
                </div>
              </div>
              {loginStatus.error && (
                <div className="text-sm text-gray-600 mt-2">Error: {loginStatus.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Phone Login Form */}
        {(!loginStatus || (loginStatus.loginStatus === 'idle' || loginStatus.loginStatus === 'failed')) && 
         !((loginStatus?.progress?.total || 0) > 0 || loginStatus?.updateStatus === 'updating' || loginStatus?.updateStatus === 'completed') && (
          <div className="mt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Phone Authentication</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin Phone</p>
                    <p className="text-sm text-gray-600 font-mono">{maskPhoneNumber(adminPhone)}</p>
                  </div>
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <button
                onClick={startPhoneLogin}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Sending SMS...' : 'Send Verification Code'}
              </button>
            </div>
          </div>
        )}

        {/* SMS Code Form */}
        {loginStatus?.loginStatus === 'waiting_sms_code' && 
         !((loginStatus?.progress?.total || 0) > 0 || loginStatus?.updateStatus === 'updating' || loginStatus?.updateStatus === 'completed') && (
          <div className="mt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">SMS Verification</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code sent to your phone</p>
            <div className="space-y-4">
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500 text-gray-900 placeholder-gray-400 font-mono text-center tracking-widest transition-colors"
                disabled={isLoading}
                maxLength={6}
              />
              <div className="flex space-x-3">
                <button
                  onClick={submitSmsCode}
                  disabled={isLoading || !smsCode}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button
                  onClick={() => {
                    setSmsCode('');
                    smsInProgressRef.current = false;
                    // 重置状态，会自动显示phone form
                    setLoginStatus(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={clearProgress}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear all progress data
          </button>
        </div>
      </div>

      {/* Data Update Progress Section */}
      {(loginStatus?.loginStatus === 'logged_in' || (loginStatus?.progress?.total || 0) > 0 || loginStatus?.updateStatus === 'updating' || loginStatus?.updateStatus === 'completed' || loginStatus?.updateStatus === 'failed') && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-medium text-gray-900">Data Collection Progress</h2>
            </div>
            {isPolling && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auto-updating</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Update Status */}
            <div className="flex items-center space-x-3">
              {loginStatus?.updateStatus === 'updating' ? (
                <>
                  <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
                  <span className="text-gray-800 font-medium">Updating notes data...</span>
                </>
              ) : loginStatus?.updateStatus === 'completed' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-800 font-medium">Update completed</span>
                </>
              ) : loginStatus?.updateStatus === 'failed' ? (
                <>
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800 font-medium">Update failed</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">Ready to update</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {loginStatus?.progress && (loginStatus?.progress.total || 0) > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{loginStatus?.progress.processed} / {loginStatus?.progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-700 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${Math.round((loginStatus?.progress.processed / loginStatus?.progress.total) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {Math.round((loginStatus?.progress.processed / loginStatus?.progress.total) * 100)}% completed
                  </span>
                  <span className="text-gray-600">
                    {loginStatus?.progress.failed > 0 && `${loginStatus?.progress.failed} failed`}
                  </span>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 p-4 rounded bg-gray-50">
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {loginStatus?.progress?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Notes</div>
              </div>
              <div className="border border-gray-200 p-4 rounded bg-gray-50">
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {loginStatus?.progress?.processed || 0}
                </div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="border border-gray-200 p-4 rounded bg-gray-50">
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {loginStatus?.progress?.failed || 0}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {/* Last Update Time */}
            {loginStatus?.lastUpdate && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div className="p-1 bg-gray-100 rounded-lg">
                  <Clock className="w-3 h-3 text-gray-500" />
                </div>
                <span>Last updated: {new Date(loginStatus?.lastUpdate).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-600" />
            </div>
            <span className="text-gray-700 font-medium">Processing request...</span>
          </div>
        </div>
      )}
    </div>
  );
}