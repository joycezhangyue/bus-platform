import { useState, useCallback } from 'react';
import {
  Plus, Server, ServerOff, Wifi, WifiOff, ArrowRight,
  Calendar, Users, CheckCircle2, AlertCircle, LayoutGrid
} from 'lucide-react';
import { ParticleBackground } from '../components/ParticleBackground';
import { DynamicHeader } from '../components/DynamicHeader';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { TripForm } from '../components/TripForm';
import { ShareButton } from '../components/ShareButton';
import { useScheduleStore } from '../hooks/useScheduleStore';
import type { Trip } from '../types';

export function Home() {
  const { trips, loading, error, synced, backendMode, stats, addTrip, updateTrip, removeTrip } = useScheduleStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);

  const handleEdit = useCallback((trip: Trip) => {
    setEditingTrip(trip);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((trip: Trip) => {
    setDeletingTrip(trip);
    if (selectedTrip?.id === trip.id) setSelectedTrip(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingTrip) return;
    await removeTrip(deletingTrip.id);
    setDeletingTrip(null);
  }, [deletingTrip, removeTrip]);

  const handleSubmit = useCallback(async (trip: Omit<Trip, 'id'>) => {
    if (editingTrip) {
      await updateTrip(editingTrip.id, trip);
      setEditingTrip(null);
    } else {
      await addTrip(trip);
    }
    setFormOpen(false);
  }, [editingTrip, addTrip, updateTrip]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingTrip(null);
  }, []);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top status bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {backendMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-200">
                <Wifi className="w-3 h-3" />
                实时同步中
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium border border-amber-200">
                <WifiOff className="w-3 h-3" />
                本地模式
              </span>
            )}
            {synced && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-3 h-3" />
                已同步
              </span>
            )}
          </div>
          <ShareButton trips={trips} />
        </div>

        {/* Error toast */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-medium border border-red-200 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Title section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                碳资产公司本周行程概览
              </h1>
              <p className="text-sm text-gray-400">公车保障情况 · 实时同步</p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{stats.wangYong}</p>
              <p className="text-xs text-gray-400">王勇行程</p>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{stats.liuPing}</p>
              <p className="text-xs text-gray-400">刘平行程</p>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{stats.unconfirmed}</p>
              <p className="text-xs text-gray-400">待确认</p>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{stats.confirmed}</p>
              <p className="text-xs text-gray-400">已确认</p>
            </div>
          </div>
        </div>

        {/* Dynamic Header */}
        <div className="mb-6">
          <DynamicHeader trips={trips} selectedTrip={selectedTrip} />
        </div>

        {/* Main content */}
        {loading ? (
          <div className="glass-panel-strong rounded-2xl p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-48" />
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                ))}
              </div>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <div className="glass-panel-strong rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无行程</h3>
            <p className="text-sm text-gray-400 mb-6">本周还没有录入任何公车行程</p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加第一条行程
            </button>
          </div>
        ) : (
          <div className="glass-panel-strong rounded-2xl p-6">
            <ScheduleGrid
              trips={trips}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 pb-8">
          <p className="text-xs text-gray-400">每日更新 · 综合办</p>
          <p className="text-[10px] text-gray-300 mt-1">碳资产公司公车保障平台</p>
          {!backendMode && (
            <p className="text-[10px] text-amber-500 mt-2 flex items-center justify-center gap-1">
              <ServerOff className="w-3 h-3" />
              当前为本地模式，数据仅保存在本设备
            </p>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-900/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Trip Form */}
      <TripForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editingTrip={editingTrip}
      />

      {/* Delete Confirmation */}
      {deletingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeletingTrip(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-2">
              删除 {deletingTrip.driver} · {deletingTrip.destination} · {deletingTrip.passenger}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {deletingTrip.departureDay} {deletingTrip.departureTime}
              {deletingTrip.returnDay ? ` → ${deletingTrip.returnDay} ${deletingTrip.returnTime || ''}` : ''}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTrip(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
