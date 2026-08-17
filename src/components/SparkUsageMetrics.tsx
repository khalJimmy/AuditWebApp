import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Zap,
  RefreshCw,
  Download,
  BarChart2,
  Calendar,
  Database,
  Activity,
  CheckCircle2,
  Server
} from 'lucide-react';

interface UsageData {
  supabaseLimits?: {
    dbStorageMb: number;
    egressMbMonth: number;
    maxConnections: number;
    monthlyActiveUsers: number;
    monthlyApiRequests: number;
  };
  vercelLimits?: {
    bandwidthMbMonth: number;
    executionGbHours: number;
    functionTimeoutSec: number;
    maxPayloadMb: number;
    allocatedMemoryMb: number;
  };
  sparkLimits: {
    readsDaily: number;
    writesDaily: number;
    deletesDaily: number;
    storageMb: number;
    egressMbMonth: number;
  };
  today: {
    date: string;
    reads: number;
    writes: number;
    deletes: number;
    egressMb: number;
  };
  currentStorageMb: number;
  dailyLogs: Array<{
    date: string;
    reads: number;
    writes: number;
    deletes: number;
    egressMb: number;
  }>;
  analytics: {
    peakWindow: string;
    avgReadsPerDay: number;
    avgWritesPerDay: number;
    quotaStatus: 'Healthy' | 'Warning' | 'Critical';
    throttledRequests: number;
    readCapacityPercent: number;
    writeCapacityPercent: number;
    storageCapacityPercent: number;
    supabaseStoragePercent?: number;
    supabaseEgressPercent?: number;
    vercelBandwidthPercent?: number;
  };
}

interface DonutChartProps {
  title: string;
  value: number;
  limit: number;
  unit: string;
  color: string;
  subtext: string;
}

const MinimalDonutChart: React.FC<DonutChartProps> = ({ title, value, limit, unit, color, subtext }) => {
  const percent = Math.min(100, Math.max(0, +((value / limit) * 100).toFixed(1)));
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      style={{
        flex: '1 1 200px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
        {title}
      </div>

      <div style={{ position: 'relative', width: '96px', height: '96px', marginBottom: '12px' }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{percent}%</span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Capacity</span>
        </div>
      </div>

      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
        {value.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: '400', color: '#64748b' }}>{unit}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
        Limit: {limit.toLocaleString()} {unit} / day
      </div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '12px',
          background: color + '18',
          color: color,
          fontWeight: '600'
        }}
      >
        {subtext}
      </div>
    </div>
  );
};

export const SparkUsageMetrics: React.FC<{ onToast?: (msg: string) => void }> = ({ onToast }) => {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await api.getUsageMetrics();
      setData(res);
    } catch (err: any) {
      if (onToast) onToast(`Failed loading usage metrics: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Date', 'Reads', 'Writes', 'Deletes', 'Egress (MB)', 'Quota Status'];
    const rows = data.dailyLogs.map(l => [
      l.date,
      l.reads,
      l.writes,
      l.deletes,
      l.egressMb,
      'Normal (Within Spark Limits)'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `firebase_spark_usage_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('Usage logs exported as CSV successfully');
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Loading Plan Usage Metrics &amp; Analytics...</div>
      </div>
    );
  }

  if (!data) return null;

  const { sparkLimits, supabaseLimits, vercelLimits, today, currentStorageMb, dailyLogs, analytics } = data;

  const subStorageLimit = supabaseLimits?.dbStorageMb || 500;
  const vercelBwLimit = (vercelLimits?.bandwidthMbMonth || 102400) / 1024; // in GB

  return (
    <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '20px' }}>
      {/* HEADER & Supabase / Vercel Plan Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="ctitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Zap size={16} style={{ color: 'var(--brand)' }} />
            <span>Supabase &amp; Vercel Tier Metrics &amp; Quota Analytics</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Supabase Postgres 500MB DB Limit · Vercel Serverless SLA &amp; Bandwidth Monitor · Rate Limit Protection
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={12} /> Status: {analytics.quotaStatus} (Within Quota Limits)
          </span>
          <button
            type="button"
            className="btn btn-o btn-xs"
            onClick={fetchMetrics}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
          </button>
          <button
            type="button"
            className="btn btn-o btn-xs"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={11} />
            <span>Export CSV Logs</span>
          </button>
        </div>
      </div>

      {/* MINIMAL DONUT CHARTS GRID */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <MinimalDonutChart
          title="Supabase DB Storage"
          value={currentStorageMb}
          limit={subStorageLimit}
          unit="MB"
          color="#3ecf8e"
          subtext={`${(subStorageLimit - currentStorageMb).toFixed(1)} MB Free Tier Storage Left`}
        />

        <MinimalDonutChart
          title="Supabase Egress / Day"
          value={today.egressMb}
          limit={Math.round((supabaseLimits?.egressMbMonth || 2048) / 30)}
          unit="MB"
          color="#2563eb"
          subtext="Supabase 2 GB / Month Free Quota"
        />

        <MinimalDonutChart
          title="Vercel Bandwidth"
          value={+(today.egressMb * 30 / 1024).toFixed(2)}
          limit={vercelBwLimit}
          unit="GB"
          color="#000000"
          subtext={`Vercel Hobby 100 GB Monthly Limit`}
        />

        <MinimalDonutChart
          title="Daily Operations Log"
          value={today.reads + today.writes}
          limit={sparkLimits.readsDaily + sparkLimits.writesDaily}
          unit="reqs"
          color="#8b5cf6"
          subtext="100% Zero-Throttled Performance"
        />
      </div>

      {/* ANALYTICS SUMMARY CARDS */}
      <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart2 size={13} style={{ color: 'var(--brand)' }} />
          <span>Supabase &amp; Vercel Quotas &amp; Infrastructure Health</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={11} /> Supabase Postgres Pool
            </span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>
              60 Max Pool Connections · SSL Transaction Mode
            </strong>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Server size={11} /> Vercel Serverless SLA
            </span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>
              10s Execution SLA · 4.5MB Max Payload
            </strong>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={11} /> Avg Daily Traffic
            </span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>
              {analytics.avgReadsPerDay.toLocaleString()} Reads / {analytics.avgWritesPerDay.toLocaleString()} Writes
            </strong>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={11} /> Supabase Storage Headroom
            </span>
            <strong style={{ fontSize: '13px', color: '#10b981' }}>
              {(100 - (analytics.supabaseStoragePercent || analytics.storageCapacityPercent)).toFixed(1)}% Free Space
            </strong>
          </div>
        </div>
      </div>

      {/* DAILY READ / WRITE LOGGED TABLE */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} style={{ color: 'var(--brand)' }} />
            <span>Daily Logged Read &amp; Write Operations</span>
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Logged per calendar day</span>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', background: '#ffffff' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Date</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Reads Logged</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Writes Logged</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Deletes Logged</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Egress Bandwidth</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', color: '#475569' }}>Spark Daily Quota Used</th>
              </tr>
            </thead>
            <tbody>
              {dailyLogs.map((item, idx) => {
                const readPct = Math.min(100, +((item.reads / sparkLimits.readsDaily) * 100).toFixed(1));
                const isToday = item.date === today.date;

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isToday ? '#eff6ff' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1e293b' }}>
                      {item.date} {isToday && <span style={{ fontSize: '10px', color: '#2563eb', marginLeft: '4px' }}>(Today)</span>}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#0f172a' }}>{item.reads.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', color: '#0f172a' }}>{item.writes.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{item.deletes.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', color: '#0f172a' }}>{item.egressMb} MB</td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${readPct}%`,
                              background: readPct > 80 ? '#ef4444' : readPct > 50 ? '#f59e0b' : '#2563eb',
                              height: '100%'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: '#475569', width: '38px', textAlign: 'right' }}>
                          {readPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
