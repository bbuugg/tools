'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired, faCopy, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '@/lib/api-client';

// IP信息接口
interface IPInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  source?: string;
  [key: string]: unknown; // 其他可能的字段
}

// API接口定义
interface ApiSource {
  name: string;
  url: string;
  responseParser: (data: unknown) => IPInfo;
  supportsQuery: boolean;
}

// API响应接口
interface ApiResponse {
  data: unknown;
  source: string;
  requestType?: 'self' | 'query';
  cached?: boolean;
}

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  input: "search-input w-full",
  textarea: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all",
  label: "text-secondary font-medium", 
  secondaryText: "text-sm text-tertiary",
  resultItem: "flex justify-between items-center py-2 border-b border-purple-glow/10",
  resultLabel: "text-sm text-secondary",
  resultValue: "text-sm text-primary font-semibold",
  iconButton: "text-tertiary hover:text-purple transition-colors",
  primaryBtn: "btn-primary flex items-center justify-center gap-2",
  resultBox: "p-3 bg-block rounded-md border border-purple-glow/30",
}

export default function IpLookup() {
  const { t, language } = useLanguage();
  
  // 状态管理
  const [ipAddress, setIpAddress] = useState<string>('');
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // API 源列表
  const apiSources: ApiSource[] = [
    {
      name: t('tools.ip_lookup.api_sources.pconline'),
      url: '/api/ip?ip={ip}&source=太平洋电脑网',
      responseParser: (data: unknown) => {
        const response = data as ApiResponse;
        try {
          const typedData = response.data as { ip?: string; addr?: string; pro?: string; city?: string };
          
          // 确保所有字段都存在并有默认值
          const addr = typedData.addr || '';
          const pro = typedData.pro || '';
          const city = typedData.city || '';
          
          return {
            ip: typedData.ip || t('tools.ip_lookup.unknown'),
            country: addr.split(' ')[0] || t('tools.ip_lookup.unknown'),
            region: pro || t('tools.ip_lookup.unknown'),
            city: city || t('tools.ip_lookup.unknown'),
            isp: addr.includes('电信') ? '电信' : 
                 addr.includes('联通') ? '联通' : 
                 addr.includes('移动') ? '移动' : 
                 addr.includes('铁通') ? '铁通' : 
                 addr.includes('网通') ? '网通' : t('tools.ip_lookup.unknown'),
            source: response.source
          };
        } catch (error) {
          console.error(t('tools.ip_lookup.console_errors.pconline'), error);
          return {
            ip: t('tools.ip_lookup.unknown'),
            country: t('tools.ip_lookup.unknown'),
            region: t('tools.ip_lookup.unknown'),
            city: t('tools.ip_lookup.unknown'),
            isp: t('tools.ip_lookup.unknown'),
            source: response.source
          };
        }
      },
      supportsQuery: true
    },
    {
      name: t('tools.ip_lookup.api_sources.ipcn'),
      url: '/api/ip?ip={ip}&source=IP.CN',
      responseParser: (data: unknown) => {
        const response = data as ApiResponse;
        try {
          const typedData = response.data as { ip?: string; address?: string };
          
          if (!typedData?.ip) {
            return {
              ip: t('tools.ip_lookup.unknown'),
              country: t('tools.ip_lookup.unknown'),
              region: t('tools.ip_lookup.unknown'),
              city: t('tools.ip_lookup.unknown'),
              isp: t('tools.ip_lookup.unknown'),
              source: response.source
            };
          }
          
          return {
            ip: typedData.ip,
            country: typedData.address?.split(' ')?.[0] || t('tools.ip_lookup.unknown'),
            region: typedData.address?.split(' ')?.[1] || t('tools.ip_lookup.unknown'),
            city: typedData.address?.split(' ')?.[2] || t('tools.ip_lookup.unknown'),
            isp: typedData.address?.split(' ')?.[3] || t('tools.ip_lookup.unknown'),
            source: response.source
          };
        } catch (error) {
          console.error(t('tools.ip_lookup.console_errors.ipcn'), error);
          return {
            ip: t('tools.ip_lookup.unknown'),
            country: t('tools.ip_lookup.unknown'),
            region: t('tools.ip_lookup.unknown'),
            city: t('tools.ip_lookup.unknown'),
            isp: t('tools.ip_lookup.unknown'),
            source: response.source
          };
        }
      },
      supportsQuery: true
    },
    {
      name: t('tools.ip_lookup.api_sources.ipapi'),
      url: '/api/ip?ip={ip}&source=ip-api.com',
      responseParser: (data: unknown) => {
        const response = data as ApiResponse;
        try {
          const typedData = response.data as { 
            query?: string; 
            country?: string; 
            regionName?: string; 
            city?: string; 
            isp?: string;
            lat?: number;
            lon?: number;
            timezone?: string;
          };
          
          if (!typedData?.query) {
            return {
              ip: t('tools.ip_lookup.unknown'),
              country: t('tools.ip_lookup.unknown'),
              region: t('tools.ip_lookup.unknown'),
              city: t('tools.ip_lookup.unknown'),
              isp: t('tools.ip_lookup.unknown'),
              source: response.source
            };
          }
          
          return {
            ip: typedData.query,
            country: typedData.country || t('tools.ip_lookup.unknown'),
            region: typedData.regionName || t('tools.ip_lookup.unknown'),
            city: typedData.city || t('tools.ip_lookup.unknown'),
            isp: typedData.isp || t('tools.ip_lookup.unknown'),
            lat: typedData.lat,
            lon: typedData.lon,
            timezone: typedData.timezone,
            source: response.source
          };
        } catch (error) {
          console.error(t('tools.ip_lookup.console_errors.ipapi'), error);
          return {
            ip: t('tools.ip_lookup.unknown'),
            country: t('tools.ip_lookup.unknown'),
            region: t('tools.ip_lookup.unknown'),
            city: t('tools.ip_lookup.unknown'),
            isp: t('tools.ip_lookup.unknown'),
            source: response.source
          };
        }
      },
      supportsQuery: true
    },
    {
      name: t('tools.ip_lookup.api_sources.baidu'),
      url: '/api/ip?ip={ip}&source=百度IP',
      responseParser: (data: unknown) => {
        const response = data as ApiResponse;
        const typedData = response.data as { 
          data: Array<{
            location: string;
            origip: string;
          }> 
        };
        
        // 安全处理
        if (!typedData.data || !typedData.data[0]) {
          return {
            ip: t('tools.ip_lookup.unknown'),
            source: response.source
          };
        }
        
        const locationInfo = typedData.data[0].location?.split(' ') || [];
        return {
          ip: typedData.data[0].origip || t('tools.ip_lookup.unknown'),
          country: locationInfo[0] || t('tools.ip_lookup.unknown'),
          region: locationInfo[1] || t('tools.ip_lookup.unknown'),
          city: locationInfo[2] || t('tools.ip_lookup.unknown'),
          isp: locationInfo[3] || t('tools.ip_lookup.unknown'),
          source: response.source
        };
      },
      supportsQuery: true
    },
    {
      name: t('tools.ip_lookup.api_sources.meitu'),
      url: '/api/ip?ip={ip}&source=美图IP',
      responseParser: (data: unknown) => {
        const response = data as ApiResponse;
        try {
          const typedData = response.data as { 
            data: { 
              [key: string]: {
                nation: string;
                province: string;
                city: string;
                isp: string;
                latitude: number;
                longitude: number;
              }
            } 
          };
          
          // 找到IP键
          const ipKey = Object.keys(typedData.data)[0];
          const ipData = typedData.data[ipKey];
          
          return {
            ip: ipKey || t('tools.ip_lookup.unknown'),
            country: ipData.nation || t('tools.ip_lookup.unknown'),
            region: ipData.province || t('tools.ip_lookup.unknown'),
            city: ipData.city || t('tools.ip_lookup.unknown'),
            isp: ipData.isp || t('tools.ip_lookup.unknown'),
            lat: ipData.latitude,
            lon: ipData.longitude,
            source: response.source
          };
        } catch (error) {
          console.error(t('tools.ip_lookup.console_errors.meitu'), error);
          return {
            ip: t('tools.ip_lookup.unknown'),
            country: t('tools.ip_lookup.unknown'),
            region: t('tools.ip_lookup.unknown'),
            city: t('tools.ip_lookup.unknown'),
            isp: t('tools.ip_lookup.unknown'),
            source: response.source
          };
        }
      },
      supportsQuery: true
    }
  ];

  // API源重构，确保语言变化时更新
  useEffect(() => {
    // 此处空实现，确保语言切换时组件重新渲染
  }, [language, t]);

  // 处理我的IP点击
  const handleMyIpClick = () => {
    setIpAddress('');
    searchIP('');
  };

  // 获取IP信息
  const fetchIPInfo = async (ip: string) => {
    setLoading(true);
    setError('');
    
    try {
      const results = await Promise.all(
        apiSources.map(async (source) => {
          try {
            const url = source.url.replace('{ip}', ip);
            const response = await apiClient.get(url);
            return source.responseParser(response);
          } catch (error) {
            console.error(`${source.name}${t('tools.ip_lookup.errors.query_failed')}:`, error);
            return null;
          }
        })
      );
      
      // 过滤掉失败的结果
      const validResults = results.filter((result): result is IPInfo => result !== null);
      
      if (validResults.length === 0) {
        throw new Error(t('tools.ip_lookup.errors.query_failed'));
      }
      
      // 优先选择包含更多有效信息的结果
      const bestResult = validResults.reduce((best, current) => {
        // 计算当前结果中非"未知"值的数量
        const bestValidFieldCount = Object.values(best).filter(val => val !== t('tools.ip_lookup.unknown')).length;
        const currentValidFieldCount = Object.values(current).filter(val => val !== t('tools.ip_lookup.unknown')).length;
        
        // 如果当前结果有更多有效信息，则选择它
        return currentValidFieldCount > bestValidFieldCount ? current : best;
      }, validResults[0]);
      
      // 使用最佳结果
      setIpInfo(bestResult);
    } catch (error) {
      setError(error instanceof Error ? error.message : t('tools.ip_lookup.errors.query_failed'));
    } finally {
      setLoading(false);
    }
  };

  // 搜索IP
  const searchIP = async (ip: string = ipAddress) => {
    if (!ip) {
      await fetchIPInfo('');
      return;
    }
    
    // 验证IP地址格式
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      setError(t('tools.ip_lookup.errors.invalid_ip'));
      return;
    }
    
    await fetchIPInfo(ip);
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (!ipInfo) return;
    
    const text = Object.entries(ipInfo)
      .filter(([key]) => !['source'].includes(key))
      .map(([key, value]) => `${t(`tools.ip_lookup.ip_info.${key}`)}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        console.error(t('tools.ip_lookup.errors.copy_failed'));
      });
  };

  // 获取IP类型
  const getIPType = (ip: string) => {
    if (!ip || ip === t('tools.ip_lookup.unknown')) return t('tools.ip_lookup.unknown');
    
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E';
    return t('tools.ip_lookup.unknown');
  };

  // 获取IP分类
  const getIPClass = (ip: string) => {
    if (!ip || ip === t('tools.ip_lookup.unknown')) return t('tools.ip_lookup.unknown');
    
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet === 10) return t('tools.ip_lookup.ip_classes.private');
    if (firstOctet === 172 && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31) return t('tools.ip_lookup.ip_classes.private');
    if (firstOctet === 192 && parseInt(ip.split('.')[1]) === 168) return t('tools.ip_lookup.ip_classes.private');
    if (firstOctet === 127) return t('tools.ip_lookup.ip_classes.loopback');
    if (firstOctet === 169 && parseInt(ip.split('.')[1]) === 254) return t('tools.ip_lookup.ip_classes.link_local');
    return t('tools.ip_lookup.ip_classes.public');
  };

  // IP转二进制
  const ipToBinary = (ip: string) => {
    if (!ip || ip === t('tools.ip_lookup.unknown')) return t('tools.ip_lookup.unknown');
    return ip.split('.').map(num => parseInt(num).toString(2).padStart(8, '0')).join('.');
  };

  // IP转十六进制
  const ipToHex = (ip: string) => {
    if (!ip || ip === t('tools.ip_lookup.unknown')) return t('tools.ip_lookup.unknown');
    return ip.split('.').map(num => parseInt(num).toString(16).padStart(2, '0')).join('.');
  };

  // 处理搜索点击
  const handleSearchClick = () => {
    searchIP();
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader
        icon={faNetworkWired}
        toolCode="ip_lookup"
        title=""
        description=""
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className={styles.card}>
            <h2 className="text-lg font-medium text-primary mb-4">{t('tools.ip_lookup.title')}</h2>
            
            <div className="mb-6">
              <label className={styles.label}>{t('tools.ip_lookup.input_label')}</label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchIP();
                      }
                    }}
                    placeholder={t('tools.ip_lookup.input_placeholder_example')}
                    className={styles.input}
                  />
                </div>
                <button
                  className={styles.primaryBtn}
                  onClick={handleSearchClick}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} />
                      {t('tools.ip_lookup.search_button')}
                    </>
                  )}
                </button>
              </div>
              
              <button
                className="mt-3 btn-secondary text-sm"
                onClick={handleMyIpClick}
                disabled={loading}
              >
                {t('tools.ip_lookup.my_ip_button')}
              </button>
              
              {error && (
                <div className="mt-3 p-2 bg-red-900/20 border border-red-700/30 text-red-500 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-primary font-medium mb-2">{t('tools.ip_lookup.instruction_title')}</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-tertiary">
                <li>{t('tools.ip_lookup.instructions.line1')}</li>
                <li>{t('tools.ip_lookup.instructions.line2')}</li>
                <li>{t('tools.ip_lookup.instructions.line3')}</li>
                <li>{t('tools.ip_lookup.instructions.line4')}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-7">
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-primary">{t('tools.ip_lookup.results.title')}</h2>
            </div>
            
            {ipInfo ? (
              <div className="space-y-4">
                <div className={styles.resultBox}>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-glow/20">
                    <h3 className="text-primary font-medium">{t('tools.ip_lookup.ip_info.ip')}: {ipInfo.ip}</h3>
                    <button
                      onClick={copyToClipboard}
                      className={styles.iconButton}
                      title={t('tools.ip_lookup.copy')}
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="ml-1" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.country')}:</span>
                      <span className={styles.resultValue}>{ipInfo.country || t('tools.ip_lookup.unknown')}</span>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.region')}:</span>
                      <span className={styles.resultValue}>{ipInfo.region || t('tools.ip_lookup.unknown')}</span>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.city')}:</span>
                      <span className={styles.resultValue}>{ipInfo.city || t('tools.ip_lookup.unknown')}</span>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.isp')}:</span>
                      <span className={styles.resultValue}>{ipInfo.isp || t('tools.ip_lookup.unknown')}</span>
                    </div>
                    
                    {ipInfo.lat && ipInfo.lon && (
                      <div className={styles.resultItem}>
                        <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.coordinates')}:</span>
                        <span className={styles.resultValue}>{ipInfo.lat}, {ipInfo.lon}</span>
                      </div>
                    )}
                    
                    {ipInfo.timezone && (
                      <div className={styles.resultItem}>
                        <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.timezone')}:</span>
                        <span className={styles.resultValue}>{ipInfo.timezone}</span>
                      </div>
                    )}
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.source')}:</span>
                      <span className={styles.resultValue}>{ipInfo.source || t('tools.ip_lookup.unknown')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-block p-4 rounded-lg border border-purple-glow/20">
                  <h3 className="text-primary font-medium mb-3">{t('tools.ip_lookup.technical_details')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.ip_type')}:</span>
                      <span className={styles.resultValue}>{getIPType(ipInfo.ip)}</span>
                    </div>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.ip_class')}:</span>
                      <span className={styles.resultValue}>{getIPClass(ipInfo.ip)}</span>
                    </div>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.binary')}:</span>
                      <span className={`${styles.resultValue} font-mono text-xs`}>{ipToBinary(ipInfo.ip)}</span>
                    </div>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.ip_lookup.ip_info.hex')}:</span>
                      <span className={`${styles.resultValue} font-mono`}>{ipToHex(ipInfo.ip)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-tertiary">
                <FontAwesomeIcon icon={faNetworkWired} className="text-4xl mb-4 opacity-20" />
                <p>{t('tools.ip_lookup.results.empty_state')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 