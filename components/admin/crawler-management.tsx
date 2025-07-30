'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, RefreshCw, AlertCircle, CheckCircle, Clock, LogIn, Smartphone, BarChart3, Activity, TrendingUp, Trash2 } from 'lucide-react';

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
  const [loginStep, setLoginStep] = useState<'phone' | 'sms'>('phone');
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const smsInProgressRef = useRef<boolean>(false);

  const CRAWLER_API_BASE = process.env.NEXT_PUBLIC_CRAWLER_API_URL || 'http://localhost:3000';

  // 手机号脱敏显示
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
      
      // 添加手动刷新时的调试日志
      console.log('🔄 [Debug] Manual progress refresh at:', new Date().toLocaleTimeString());
      console.log('🔄 [Debug] Manual refresh response:', data);
      console.log('🔄 [Debug] Manual refresh progress:', {
        total: data.data?.progress?.total,
        processed: data.data?.progress?.processed,
        failed: data.data?.progress?.failed
      });
      
      if (data.success) {
        setLoginStatus(data.data);
        
        // 添加手动刷新的进度更新日志
        console.log('🔄 [Debug] Manual refresh - Progress updated in UI:', {
          updateStatus: data.data?.updateStatus,
          progress: data.data?.progress,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // 根据状态调整UI，但不覆盖用户手动设置的loginStep
        if (data.data.loginStatus === 'waiting_sms_code' && loginStep !== 'sms') {
          console.log('🔄 [Debug] Server status is waiting_sms_code, switching to sms step');
          setLoginStep('sms');
        } else if (data.data.loginStatus === 'logged_in') {
          console.log('🔄 [Debug] Server status is logged_in, switching to phone step');
          smsInProgressRef.current = false; // 重置SMS进程标志
          setLoginStep('phone');
        } else if (data.data.loginStatus === 'idle' && loginStep === 'sms' && !smsInProgressRef.current) {
          // 只有当当前是sms步骤、服务器状态为idle且没有SMS进程进行时，才切换回phone
          console.log('🔄 [Debug] Server status is idle and current step is sms (no SMS in progress), switching to phone step');
          setLoginStep('phone');
        } else if (data.data.loginStatus === 'idle' && smsInProgressRef.current) {
          console.log('🔄 [Debug] Server status is idle but SMS in progress, keeping current step');
        }
      }
    } catch (error) {
      console.error('Failed to load login status:', error);
    }
  }, [CRAWLER_API_BASE]);

  useEffect(() => {
    loadLoginStatus();
  }, [loadLoginStatus]);

  // 开始轮询状态更新
  const startProgressPolling = useCallback(() => {
    if (isPolling || pollIntervalRef.current) return; // 防止重复轮询
    
    setIsPolling(true);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${CRAWLER_API_BASE}/progress`);
        const data = await response.json();
        
        // 添加详细调试日志
        console.log('🔍 [Debug] Status API called at:', new Date().toLocaleTimeString());
        console.log('🔍 [Debug] Full API response:', data);
        console.log('🔍 [Debug] Login Status:', data.data?.loginStatus);
        console.log('🔍 [Debug] Update Status:', data.data?.updateStatus);
        console.log('🔍 [Debug] Progress Data:', {
          total: data.data?.progress?.total,
          processed: data.data?.progress?.processed,
          failed: data.data?.progress?.failed
        });
        
        if (data.success) {
          setLoginStatus(data.data);
          
          // 添加进度更新调试日志
          console.log('🔄 [Debug] Progress updated in UI:', {
            updateStatus: data.data?.updateStatus,
            progress: data.data?.progress,
            timestamp: new Date().toLocaleTimeString()
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
    }, 10000); // 每10秒轮询一次

    // 设置最大轮询时间（10分钟）
    pollTimeoutRef.current = setTimeout(() => {
      stopProgressPolling();
    }, 600000);
  }, [CRAWLER_API_BASE]);

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
    setIsPolling(false);
  }, []);

  // 监听登录状态变化，自动开始轮询
  useEffect(() => {
    if (loginStatus?.loginStatus === 'logged_in' && loginStatus?.updateStatus === 'updating') {
      startProgressPolling();
    }
    
    return stopProgressPolling;
  }, [loginStatus?.loginStatus, loginStatus?.updateStatus]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return stopProgressPolling;
  }, []);

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
        setLoginStep('sms');
        console.log('🔄 [Debug] SMS sent successfully, switching to SMS input step');
        // 延迟加载状态，避免立即覆盖loginStep
        setTimeout(() => loadLoginStatus(), 2000);
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
        loadLoginStatus();
        // 轮询检查登录状态
        const checkLogin = setInterval(() => {
          loadLoginStatus();
          if (loginStatus?.loginStatus === 'logged_in') {
            clearInterval(checkLogin);
            setLoginStep('phone');
            setPhoneNumber('');
            setSmsCode('');
          }
        }, 2000);
        setTimeout(() => clearInterval(checkLogin), 30000); // 30秒后停止轮询
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

  const clearProgress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${CRAWLER_API_BASE}/progress/clear`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Progress data cleared successfully');
        // 重置所有本地状态
        setLoginStatus(null);
        setLoginStep('phone');
        setSmsCode('');
        smsInProgressRef.current = false;
        stopProgressPolling();
        
        // 重新加载状态
        setTimeout(() => loadLoginStatus(), 500);
      } else {
        console.error('Failed to clear progress data:', data.message);
      }
    } catch (error) {
      console.error('Failed to clear progress data:', error);
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
              {loginStatus.loginStatus === 'logged_in' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Logged in to Xiaohongshu</span>
                </>
              ) : loginStatus.loginStatus === 'waiting_sms_code' ? (
                <>
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-700 font-medium">Waiting for SMS code</span>
                </>
              ) : loginStatus.loginStatus === 'logging_in' ? (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-blue-700 font-medium">Logging in...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Not logged in</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {loginStatus.lastUpdate && (
                <div>Last update: {new Date(loginStatus.lastUpdate).toLocaleString()}</div>
              )}
              {loginStatus.error && (
                <div className="text-red-600">Error: {loginStatus.error}</div>
              )}
            </div>
          </div>
        )}

        {/* Phone Login Form */}
        {loginStep === 'phone' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Admin phone login:</p>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Admin phone: <span className="font-mono">{maskPhoneNumber(adminPhone)}</span>
                  </span>
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <button
                onClick={startPhoneLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isLoading ? 'Sending SMS...' : 'Send SMS Code to Admin Phone'}</span>
              </button>
            </div>
          </div>
        )}

        {/* SMS Code Form */}
        {loginStep === 'sms' && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-700">Enter the SMS verification code:</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="Enter 4-6 digit SMS code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 placeholder-gray-500"
                disabled={isLoading}
                maxLength={6}
              />
              <div className="flex space-x-2">
                <button
                  onClick={submitSmsCode}
                  disabled={isLoading || !smsCode}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Login'}</span>
                </button>
                <button
                  onClick={() => {
                    setLoginStep('phone');
                    setSmsCode('');
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={clearProgress}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Progress</span>
          </button>
        </div>
      </div>

      {/* Data Update Progress Section */}
      {loginStatus?.loginStatus === 'logged_in' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Data Update Progress</h2>
            </div>
            {isPolling && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auto-refreshing...</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Update Status */}
            <div className="flex items-center space-x-3">
              {loginStatus.updateStatus === 'updating' ? (
                <>
                  <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span className="text-blue-700 font-medium">Updating notes data...</span>
                </>
              ) : loginStatus.updateStatus === 'completed' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Update completed</span>
                </>
              ) : loginStatus.updateStatus === 'failed' ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Update failed</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">Ready to update</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {loginStatus.progress && loginStatus.progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{loginStatus.progress.processed} / {loginStatus.progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${Math.round((loginStatus.progress.processed / loginStatus.progress.total) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {Math.round((loginStatus.progress.processed / loginStatus.progress.total) * 100)}% completed
                  </span>
                  <span className="text-red-600">
                    {loginStatus.progress.failed > 0 && `${loginStatus.progress.failed} failed`}
                  </span>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {loginStatus.progress?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Notes</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {loginStatus.progress?.processed || 0}
                </div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {loginStatus.progress?.failed || 0}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {/* Last Update Time */}
            {loginStatus.lastUpdate && (
              <div className="text-sm text-gray-500 pt-2 border-t">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Last updated: {new Date(loginStatus.lastUpdate).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Clock className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600">Processing...</span>
        </div>
      )}
    </div>
  );
}