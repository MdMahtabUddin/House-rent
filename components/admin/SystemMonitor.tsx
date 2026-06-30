'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Database, Server, Cpu, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetricsAndLogs = async () => {
    try {
      const [metricsRes, logsRes] = await Promise.all([
        fetch('/api/system/metrics'),
        fetch('/api/system/logs')
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      console.error('Failed to fetch system data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndLogs();
    const interval = setInterval(fetchMetricsAndLogs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = async () => {
    if (confirm('Clear all system logs?')) {
      await fetch('/api/system/logs', { method: 'DELETE' });
      fetchMetricsAndLogs();
    }
  };

  if (loading && !metrics) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading System Data...</div>;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memory Card */}
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Server className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">{metrics?.osMemory?.usagePercentage}%</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Server RAM Usage</p>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${Number(metrics?.osMemory?.usagePercentage) > 85 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, Number(metrics?.osMemory?.usagePercentage || 0))}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">
              {formatBytes(metrics?.osMemory?.used || 0)} / {formatBytes(metrics?.osMemory?.total || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Database Card */}
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-md ${metrics?.database?.status === 'Connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {metrics?.database?.status}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">MongoDB Details</p>
            <p className="text-xs text-gray-400 truncate">Host: {metrics?.database?.host}</p>
            <p className="text-xs text-gray-400 truncate">DB Name: {metrics?.database?.name}</p>
          </CardContent>
        </Card>

        {/* Node Process Card */}
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <Cpu className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Node Process Heap</p>
            <p className="text-xs text-gray-400">Used: {formatBytes(metrics?.nodeMemory?.heapUsed || 0)}</p>
            <p className="text-xs text-gray-400">Total: {formatBytes(metrics?.nodeMemory?.heapTotal || 0)}</p>
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">System Uptime</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {Math.floor((metrics?.system?.uptime || 0) / 3600)}h {Math.floor(((metrics?.system?.uptime || 0) % 3600) / 60)}m
            </p>
            <p className="text-xs text-gray-400 uppercase">{metrics?.system?.platform} | {metrics?.system?.cpus} Cores</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Terminal */}
      <Card className="rounded-2xl border-0 shadow-xl bg-slate-950 text-slate-300 overflow-hidden">
        <CardHeader className="border-b border-slate-800 p-4 bg-slate-900 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-sm font-bold text-white tracking-widest">SERVER LOGS</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-white hover:bg-slate-800" onClick={fetchMetricsAndLogs}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={handleClearLogs}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-4 font-mono text-xs space-y-3">
            {logs.length === 0 ? (
              <div className="text-center text-slate-600 mt-10">No recent errors or warnings recorded.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`p-3 rounded-lg border ${log.type === 'error' ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-yellow-950/30 border-yellow-900/50 text-yellow-400'}`}>
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    <span className="font-bold uppercase">[{log.type}]</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap break-words">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
