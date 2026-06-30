'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Activity, Database, Server, Cpu, RefreshCw, Trash2, AlertCircle, Info, Download, Pause, Play, Filter } from 'lucide-react';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn'>('all');

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
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(fetchMetricsAndLogs, 5000); // Poll every 5s
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const handleClearLogs = async () => {
    if (confirm('Clear all system logs?')) {
      await fetch('/api/system/logs', { method: 'DELETE' });
      fetchMetricsAndLogs();
    }
  };

  const handleDownloadLogs = () => {
    const textContent = logs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Card onClick={() => { fetchMetricsAndLogs(); setDetailsModal('memory'); }} className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"><Info className="w-4 h-4" /></div>
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
        <Card onClick={() => { fetchMetricsAndLogs(); setDetailsModal('database'); }} className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500"><Info className="w-4 h-4" /></div>
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
        <Card onClick={() => { fetchMetricsAndLogs(); setDetailsModal('node'); }} className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500"><Info className="w-4 h-4" /></div>
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
        <Card onClick={() => { fetchMetricsAndLogs(); setDetailsModal('system'); }} className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500"><Info className="w-4 h-4" /></div>
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
            <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1 mr-2">
              <Button size="sm" variant="ghost" className={`h-7 px-2 text-xs ${logFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`} onClick={() => setLogFilter('all')}>All</Button>
              <Button size="sm" variant="ghost" className={`h-7 px-2 text-xs ${logFilter === 'error' ? 'bg-red-900/50 text-red-400' : 'text-slate-400'}`} onClick={() => setLogFilter('error')}>Errors</Button>
              <Button size="sm" variant="ghost" className={`h-7 px-2 text-xs ${logFilter === 'warn' ? 'bg-yellow-900/50 text-yellow-400' : 'text-slate-400'}`} onClick={() => setLogFilter('warn')}>Warns</Button>
            </div>
            <Button size="sm" variant="ghost" className={`h-8 text-slate-400 hover:text-white hover:bg-slate-800 ${isAutoRefresh ? 'text-emerald-400' : ''}`} onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
              {isAutoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />} 
              Auto
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-white hover:bg-slate-800" onClick={handleDownloadLogs}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
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
              logs.filter(log => logFilter === 'all' || log.type === logFilter).map((log, i) => (
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

      <Dialog open={!!detailsModal} onOpenChange={(open) => !open && setDetailsModal(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {detailsModal === 'memory' && <><Server className="text-blue-500 w-5 h-5"/> Server Memory Details</>}
              {detailsModal === 'database' && <><Database className="text-emerald-500 w-5 h-5"/> Database Connection</>}
              {detailsModal === 'node' && <><Cpu className="text-purple-500 w-5 h-5"/> Node.js Process Details</>}
              {detailsModal === 'system' && <><Activity className="text-orange-500 w-5 h-5"/> System & OS Info</>}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {detailsModal === 'memory' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Total Memory:</span> <span className="font-mono font-medium">{formatBytes(metrics?.osMemory?.total)}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Free Memory:</span> <span className="font-mono font-medium text-emerald-600">{formatBytes(metrics?.osMemory?.free)}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Used Memory:</span> <span className="font-mono font-medium text-rose-600">{formatBytes(metrics?.osMemory?.used)}</span></div>
                <div className="flex justify-between pb-2"><span className="text-gray-500">Usage %:</span> <span className="font-mono font-medium">{metrics?.osMemory?.usagePercentage}%</span></div>
              </div>
            )}
            {detailsModal === 'database' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Status:</span> <span className={`font-medium ${metrics?.database?.status === 'Connected' ? 'text-emerald-600' : 'text-rose-600'}`}>{metrics?.database?.status}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Host:</span> <span className="font-mono font-medium">{metrics?.database?.host}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Database Name:</span> <span className="font-mono font-medium">{metrics?.database?.name}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Total Landlords:</span> <span className="font-mono font-medium text-blue-600">{metrics?.database?.totalLandlords || 0}</span></div>
                <div className="flex justify-between pb-2"><span className="text-gray-500">Total Tenants:</span> <span className="font-mono font-medium text-orange-600">{metrics?.database?.totalTenants || 0}</span></div>
              </div>
            )}
            {detailsModal === 'node' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">RSS (Resident Set Size):</span> <span className="font-mono font-medium">{formatBytes(metrics?.nodeMemory?.rss)}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Heap Total:</span> <span className="font-mono font-medium">{formatBytes(metrics?.nodeMemory?.heapTotal)}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Heap Used:</span> <span className="font-mono font-medium text-blue-600">{formatBytes(metrics?.nodeMemory?.heapUsed)}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">External V8 Memory:</span> <span className="font-mono font-medium">{formatBytes(metrics?.nodeMemory?.external)}</span></div>
                <div className="flex justify-between pb-2"><span className="text-gray-500">Node Process Uptime:</span> <span className="font-mono font-medium">{Math.floor((metrics?.system?.nodeUptime || 0) / 3600)}h {Math.floor(((metrics?.system?.nodeUptime || 0) % 3600) / 60)}m {Math.floor((metrics?.system?.nodeUptime || 0) % 60)}s</span></div>
              </div>
            )}
            {detailsModal === 'system' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">Platform:</span> <span className="font-mono font-medium uppercase">{metrics?.system?.platform}</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">CPU Cores:</span> <span className="font-mono font-medium">{metrics?.system?.cpus} Cores</span></div>
                <div className="flex justify-between border-b dark:border-gray-800 pb-2"><span className="text-gray-500">CPU Load (1m, 5m, 15m):</span> <span className="font-mono font-medium">{metrics?.system?.loadAvg?.map((l: number) => l.toFixed(2)).join(', ') || 'N/A'}</span></div>
                <div className="flex justify-between pb-2"><span className="text-gray-500">Server OS Uptime:</span> <span className="font-mono font-medium">{Math.floor((metrics?.system?.uptime || 0) / 3600)} hours, {Math.floor(((metrics?.system?.uptime || 0) % 3600) / 60)} mins</span></div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setDetailsModal(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white rounded-xl">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
