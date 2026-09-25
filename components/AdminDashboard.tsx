'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Member,
  PlanData,
  SiteContent,
  AccessLog,
  AnthropometricRecord,
} from '@/lib/types';
import { OA_LOGO } from '@/lib/logo';
import {
  loadStoredMembers,
  loadStoredPlans,
  loadStoredSiteContent,
  loadStoredLogs,
  saveMembers,
  saveSiteContent,
  registerNewMember,
  recordMemberPayment,
  addMemberAnthropometry,
  resetAllDataToDefault,
} from '@/lib/gym-store';
import { DigitalCarnetCard } from './DigitalCarnetCard';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Activity,
  CreditCard,
  History,
  LayoutDashboard,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  LogOut,
  Download,
  Dumbbell,
  Clock,
  Sparkles,
  Printer,
  RotateCcw,
  Check,
  Send,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Fingerprint,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'anthropometry' | 'payments' | 'audit' | 'content'>('kpis');
  const [members, setMembers] = useState<Member[]>(() => {
    if (typeof window !== 'undefined') return loadStoredMembers();
    return [];
  });
  const [siteContent, setSiteContent] = useState<SiteContent | null>(() => {
    if (typeof window !== 'undefined') return loadStoredSiteContent();
    return null;
  });
  const [logs, setLogs] = useState<AccessLog[]>(() => {
    if (typeof window !== 'undefined') return loadStoredLogs();
    return [];
  });
  const [plans, setPlans] = useState<PlanData[]>(() => {
    if (typeof window !== 'undefined') return loadStoredPlans();
    return [];
  });

  // User search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(() => {
    if (typeof window !== 'undefined') {
      const mems = loadStoredMembers();
      return mems[0] || null;
    }
    return null;
  });

  // New user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    cedula: '',
    phone: '',
    birthDate: '1998-05-12',
    email: '',
    planId: 'mensualidad-base',
    initialDays: 30,
    assignedTrainer: 'Prof. Óscar Arias (Head Coach)',
    bloodType: 'O+',
    emergencyContact: 'Familiar directo',
    emergencyPhone: '3120000000',
    routineTitle: 'Fase 1: Acondicionamiento & Biomecánica Básica',
    routineGoals: 'Aumento de fuerza base y control postural.',
    nutritionOverview: 'Pauta energética balanceada con 2g/kg de proteína.',
  });

  // Anthropometry form state
  const [selectedAnthMemberId, setSelectedAnthMemberId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const mems = loadStoredMembers();
      return mems[0]?.id || '';
    }
    return '';
  });
  const [anthData, setAnthData] = useState({
    weightKg: 75.0,
    heightCm: 175,
    bodyFatPct: 18.0,
    muscleMassKg: 36.0,
    chestCm: 100,
    waistCm: 84,
    bicepCm: 35,
    notes: 'Excelente disposición técnica. Buen rango de movimiento en dorsiflexión y sentadilla.',
    evaluator: 'Lic. Óscar Arias',
  });
  const [anthSuccessMsg, setAnthSuccessMsg] = useState(false);

  // Payment registration form state
  const [selectedPayMemberId, setSelectedPayMemberId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const mems = loadStoredMembers();
      return mems[0]?.id || '';
    }
    return '';
  });
  const [paymentData, setPaymentData] = useState({
    amount: 35,
    daysAdded: 30,
    method: 'Efectivo' as const,
    notes: 'Renovación Mensualidad Base en recepción',
  });
  const [paySuccessMsg, setPaySuccessMsg] = useState(false);

  // Content form state
  const [contentForm, setContentForm] = useState<SiteContent | null>(() => {
    if (typeof window !== 'undefined') return loadStoredSiteContent();
    return null;
  });
  const [contentSavedMsg, setContentSavedMsg] = useState(false);

  // Load and subscribe to store changes
  const reloadData = useCallback(() => {
    const mems = loadStoredMembers();
    setMembers(mems);
    setPlans(loadStoredPlans());
    const sc = loadStoredSiteContent();
    setSiteContent(sc);
    setContentForm(sc);
    setLogs(loadStoredLogs());

    if (mems.length > 0 && !selectedMember) {
      setSelectedMember(mems[0]);
    }
    if (mems.length > 0 && !selectedAnthMemberId) {
      setSelectedAnthMemberId(mems[0].id);
    }
    if (mems.length > 0 && !selectedPayMemberId) {
      setSelectedPayMemberId(mems[0].id);
    }
  }, [selectedMember, selectedAnthMemberId, selectedPayMemberId]);

  useEffect(() => {
    window.addEventListener('oa_gym_data_change', reloadData);
    return () => window.removeEventListener('oa_gym_data_change', reloadData);
  }, [reloadData]);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cedula.includes(searchQuery) ||
      m.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => m.status === 'expiring').length;
  const expiredCount = members.filter((m) => m.status === 'expired').length;
  const totalMembers = members.length;

  // Status Donut Chart Data
  const statusDonutData = [
    { name: 'Activos 🟢', value: activeCount, color: '#10b981' },
    { name: 'Próximos a Vencer 🟠', value: expiringCount, color: '#f59e0b' },
    { name: 'En Mora / Suspendidos 🔴', value: expiredCount, color: '#ef4444' },
  ];

  // Access Traffic Data (Peak Hours Histogram)
  const trafficPeakData = [
    { hour: '06:00', ingresos: 48 },
    { hour: '07:30', ingresos: 62 },
    { hour: '09:00', ingresos: 35 },
    { hour: '11:00', ingresos: 22 },
    { hour: '13:00', ingresos: 18 },
    { hour: '15:00', ingresos: 26 },
    { hour: '17:00', ingresos: 58 },
    { hour: '18:30', ingresos: 84 },
    { hour: '20:00', ingresos: 71 },
    { hour: '21:30', ingresos: 29 },
  ];

  // Churn vs Reactivated Data
  const churnData = [
    { mes: 'Mayo', reactivados: 24, bajas: 4 },
    { mes: 'Junio', reactivados: 31, bajas: 6 },
    { mes: 'Julio', reactivados: 38, bajas: 5 },
    { mes: 'Agosto', reactivados: 42, bajas: 7 },
    { mes: 'Septiembre', reactivados: 45, bajas: 3 },
  ];

  // Access Methods comparison
  const qrAccessCount = logs.filter((l) => l.method.includes('QR')).length;
  const cedulaAccessCount = logs.filter((l) => l.method === 'Cédula').length;

  // Monitoring adherence (% of active members with at least 1 record in last 30 days)
  const monitoredMembersCount = members.filter((m) => m.records.length > 0).length;
  const adherenceRate = totalMembers > 0 ? Math.round((monitoredMembersCount / totalMembers) * 100) : 0;

  // Handle register user
  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    const planObj = plans.find((p) => p.id === newUserData.planId);
    const planName = planObj ? planObj.name : 'Plan Personalizado';

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + Number(newUserData.initialDays));

    const created = registerNewMember({
      name: newUserData.name,
      cedula: newUserData.cedula.trim().replace(/[.-]/g, ''),
      phone: newUserData.phone,
      birthDate: newUserData.birthDate,
      email: newUserData.email || `${newUserData.cedula}@oagym.com`,
      planId: newUserData.planId,
      planName,
      membershipStart: today.toISOString().split('T')[0],
      membershipEnd: endDate.toISOString().split('T')[0],
      assignedTrainer: newUserData.assignedTrainer,
      emergencyContact: newUserData.emergencyContact,
      emergencyPhone: newUserData.emergencyPhone,
      bloodType: newUserData.bloodType,
      routineTitle: newUserData.routineTitle,
      routineGoals: newUserData.routineGoals,
      nutritionOverview: newUserData.nutritionOverview,
      initialDays: Number(newUserData.initialDays),
    });

    setShowAddUserModal(false);
    setSelectedMember(created);
    reloadData();
  };

  // Handle record anthropometry
  const handleSaveAnthropometry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnthMemberId) return;

    addMemberAnthropometry(selectedAnthMemberId, {
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(anthData.weightKg),
      heightCm: Number(anthData.heightCm),
      bodyFatPct: Number(anthData.bodyFatPct),
      muscleMassKg: Number(anthData.muscleMassKg),
      chestCm: anthData.chestCm ? Number(anthData.chestCm) : undefined,
      waistCm: anthData.waistCm ? Number(anthData.waistCm) : undefined,
      bicepCm: anthData.bicepCm ? Number(anthData.bicepCm) : undefined,
      notes: anthData.notes,
      evaluator: anthData.evaluator,
    });

    setAnthSuccessMsg(true);
    setTimeout(() => setAnthSuccessMsg(false), 3000);
    reloadData();
  };

  // Handle record payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayMemberId) return;

    recordMemberPayment(
      selectedPayMemberId,
      Number(paymentData.daysAdded),
      Number(paymentData.amount),
      paymentData.method,
      paymentData.notes
    );

    setPaySuccessMsg(true);
    setTimeout(() => setPaySuccessMsg(false), 3000);
    reloadData();
  };

  // Handle save content
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm) return;
    saveSiteContent(contentForm);
    setContentSavedMsg(true);
    setTimeout(() => setContentSavedMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-[#E5E7EB] pb-20">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-20 flex items-center">
              <Image
                src={OA_LOGO}
                alt="OA GYM Logo Oficial"
                width={100}
                height={36}
                className="h-full w-auto max-h-9 object-contain drop-shadow"
              />
            </div>
            <div className="border-l border-zinc-800 pl-2.5">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white leading-none">
                  OA GYM Control Panel • Staff
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800/60 uppercase tracking-wider">
                  Admin Master
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Sesión autenticada: Óscar Arias (Head Director)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Restablecer datos de demostración a valores iniciales?')) {
                  resetAllDataToDefault();
                  reloadData();
                }
              }}
              title="Restablecer base de prueba"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Salir del Staff</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Module Navigation Tabs */}
      <div className="border-b border-zinc-800 bg-zinc-950/60">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          <button
            type="button"
            id="admin-tab-kpis"
            onClick={() => setActiveTab('kpis')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'kpis'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Módulo 4: KPIs & Estadísticas</span>
          </button>

          <button
            type="button"
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Usuarios & Carnets</span>
          </button>

          <button
            type="button"
            id="admin-tab-anthropometry"
            onClick={() => setActiveTab('anthropometry')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'anthropometry'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Carga Antropométrica</span>
          </button>

          <button
            type="button"
            id="admin-tab-payments"
            onClick={() => setActiveTab('payments')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Control de Pagos Manual</span>
          </button>

          <button
            type="button"
            id="admin-tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Logs de Auditoría ({logs.length})</span>
          </button>

          <button
            type="button"
            id="admin-tab-content"
            onClick={() => setActiveTab('content')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Gestor de Contenido Web</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* ======================================================== */}
        {/* TAB 1: MODULE 4 - KPIS & DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            {/* KPI Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Total Socios Registrados
                </span>
                <div className="mt-1 text-3xl font-black text-white">{totalMembers}</div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  <span>En base de datos OA</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-900/40 bg-zinc-950 p-4 shadow-xl">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Socios Activos (🟢)
                </span>
                <div className="mt-1 text-3xl font-black text-emerald-400">{activeCount}</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  {totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0}% de la base
                </div>
              </div>

              <div className="rounded-2xl border border-amber-900/40 bg-zinc-950 p-4 shadow-xl">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Vence Pronto (🟠 &le;7 días)
                </span>
                <div className="mt-1 text-3xl font-black text-amber-400">{expiringCount}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Alerta de cobranza preventiva</div>
              </div>

              <div className="rounded-2xl border border-rose-900/40 bg-zinc-950 p-4 shadow-xl">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">
                  En Mora / Suspendidos (🔴)
                </span>
                <div className="mt-1 text-3xl font-black text-rose-500">{expiredCount}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Bloqueo de PDF y torniquete</div>
              </div>
            </div>

            {/* Charts Row 1: Distribution Donut + Peak Traffic Histogram */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Distribution Donut */}
              <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
                <div className="pb-3 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-400" />
                    Distribución de Estados Semafóricos
                  </h3>
                  <p className="text-xs text-zinc-400">Población Activa vs Alerta vs Suspensión</p>
                </div>

                <div className="h-[240px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#09090b" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peak Traffic Histogram */}
              <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
                <div className="pb-3 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sky-400" />
                    Tráfico de Accesos por Franja Horaria (Horas Pico)
                  </h3>
                  <p className="text-xs text-zinc-400">Concurrencia en sala de musculación y torniquetes</p>
                </div>

                <div className="h-[240px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficPeakData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="ingresos" name="Socios Simultáneos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2: Churn & Retention + Adherence & Collections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Churn vs Reactivated */}
              <div className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
                <div className="pb-3 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Tasa de Retención vs Abandono (Churn Rate)
                  </h3>
                  <p className="text-xs text-zinc-400">Evolución mensual de reactivados frente a bajas</p>
                </div>

                <div className="h-[220px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={churnData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="mes" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar dataKey="reactivados" name="Renovaciones Exitosas" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bajas" name="Vencidos No Renovados" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Collections & Adherence Widget */}
              <div className="lg:col-span-6 space-y-4">
                {/* Adherence Rate Banner */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Tasa de Adherencia al Monitoreo
                      </span>
                      <h4 className="text-2xl font-black text-white mt-1">{adherenceRate}%</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {monitoredMembersCount} de {totalMembers} socios evaluados en los últimos 30 días
                      </p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-600/40">
                      <Activity className="h-7 w-7" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                      style={{ width: `${adherenceRate}%` }}
                    />
                  </div>
                </div>

                {/* Proactive Collections Alert Widget */}
                <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Alerta de Próximos Vencimientos (Widget de Cobranza Proactiva)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold rounded-full bg-amber-900/60 px-2 py-0.5 text-amber-300 font-mono">
                      {expiringCount} socios
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {members
                      .filter((m) => m.status === 'expiring')
                      .slice(0, 3)
                      .map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between rounded-xl bg-zinc-900/80 p-2.5 text-xs border border-zinc-800"
                        >
                          <div>
                            <span className="font-bold text-white block">{exp.name}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              Cédula: {exp.cedula} • Quedan {exp.daysRemaining} días
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/${exp.phone.replace(/[^0-9]/g, '').startsWith('58') ? exp.phone.replace(/[^0-9]/g, '') : exp.phone.replace(/[^0-9]/g, '').startsWith('0') ? '58' + exp.phone.replace(/[^0-9]/g, '').slice(1) : '58' + exp.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(
                              exp.name
                            )},%20te%20saludamos%20de%20OA%20GYM.%20Tu%20suscripci%C3%B3n%20vence%20en%20${
                              exp.daysRemaining
                            }%20d%C3%ADas.%20Renueva%20hoy%20mismo%20para%20evitar%20interrupciones.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow transition-all"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      ))}

                    {expiringCount === 0 && (
                      <p className="text-xs text-zinc-400 text-center py-2">
                        No hay socios próximos a vencer en los siguientes 7 días.
                      </p>
                    )}
                  </div>
                </div>

                {/* Method Usage: QR vs Cédula */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block font-semibold">
                      Accesos por QR Carnet
                    </span>
                    <span className="text-xl font-black text-blue-400 font-mono">{qrAccessCount}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-zinc-800" />
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block font-semibold">
                      Accesos Manual Cédula
                    </span>
                    <span className="text-xl font-black text-zinc-300 font-mono">{cedulaAccessCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MODULE 3 - USER DIRECTORY & CARNET GENERATION */}
        {/* ======================================================== */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: User Table & Search */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Directorio de Socios OA GYM</h3>
                  <p className="text-xs text-zinc-400">Gestión de membresías y generación de carnets</p>
                </div>

                <button
                  type="button"
                  id="btn-open-add-user-modal"
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Socio</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, cédula o plan..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                    }`}
                  >
                    Todos ({members.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusFilter === 'active' ? 'bg-emerald-950 text-emerald-300' : 'text-zinc-400'
                    }`}
                  >
                    Activos ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('expiring')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusFilter === 'expiring' ? 'bg-amber-950 text-amber-300' : 'text-zinc-400'
                    }`}
                  >
                    Alerta ({expiringCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('expired')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusFilter === 'expired' ? 'bg-rose-950 text-rose-300' : 'text-zinc-400'
                    }`}
                  >
                    Mora ({expiredCount})
                  </button>
                </div>
              </div>

              {/* Members List Cards */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                      selectedMember?.id === m.id
                        ? 'border-blue-500 bg-blue-950/20 shadow-md'
                        : 'border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 font-bold text-white border border-zinc-800">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{m.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                          <span>CC: {m.cedula}</span>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{m.planName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : m.status === 'expiring'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {m.daysRemaining} d • {m.status === 'active' ? 'Activo' : m.status === 'expiring' ? 'Alerta' : 'Mora'}
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Hasta {m.membershipEnd}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Selected Member Carnet Generator Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {selectedMember ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Vista Previa de Carnet
                    </h4>
                    <span className="text-xs text-zinc-400 font-mono">
                      Cédula: {selectedMember.cedula}
                    </span>
                  </div>

                  <DigitalCarnetCard member={selectedMember} allowDownload={true} />

                  {/* Actions for this user */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnthMemberId(selectedMember.id);
                        setActiveTab('anthropometry');
                      }}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 p-2.5 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Activity className="h-3.5 w-3.5 text-blue-400" />
                      Cargar Antropometría
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayMemberId(selectedMember.id);
                        setActiveTab('payments');
                      }}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 p-2.5 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      Registrar Abono
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                  Selecciona un socio de la lista para ver su carnet digital en alta resolución.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MODULE 3 - ANTHROPOMETRIC DATA INPUT */}
        {/* ======================================================== */}
        {activeTab === 'anthropometry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Módulo de Carga Antropométrica</h3>
                <p className="text-xs text-zinc-400">
                  Registra periódicamente peso, talla, % grasa corporal y masa magra para actualizar las gráficas del socio
                </p>
              </div>

              {anthSuccessMsg && (
                <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>¡Medición antropométrica registrada con éxito! Gráficos del socio actualizados.</span>
                </div>
              )}

              <form onSubmit={handleSaveAnthropometry} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
                {/* Select Member */}
                <div>
                  <label htmlFor="select-anth-member" className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                    Seleccionar Socio a Evaluar
                  </label>
                  <select
                    id="select-anth-member"
                    value={selectedAnthMemberId}
                    onChange={(e) => setSelectedAnthMemberId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (CC: {m.cedula}) - {m.planName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="input-anth-weight" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Peso Total (kg) *
                    </label>
                    <input
                      id="input-anth-weight"
                      type="number"
                      step="0.1"
                      value={anthData.weightKg}
                      onChange={(e) => setAnthData({ ...anthData, weightKg: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="input-anth-height" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Estatura (cm) *
                    </label>
                    <input
                      id="input-anth-height"
                      type="number"
                      value={anthData.heightCm}
                      onChange={(e) => setAnthData({ ...anthData, heightCm: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="input-anth-fat" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      % Grasa *
                    </label>
                    <input
                      id="input-anth-fat"
                      type="number"
                      step="0.1"
                      value={anthData.bodyFatPct}
                      onChange={(e) => setAnthData({ ...anthData, bodyFatPct: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="input-anth-muscle" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Masa Muscular (kg) *
                    </label>
                    <input
                      id="input-anth-muscle"
                      type="number"
                      step="0.1"
                      value={anthData.muscleMassKg}
                      onChange={(e) => setAnthData({ ...anthData, muscleMassKg: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Perimeters Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-anth-chest" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Tórax / Pecho (cm)
                    </label>
                    <input
                      id="input-anth-chest"
                      type="number"
                      step="0.5"
                      value={anthData.chestCm}
                      onChange={(e) => setAnthData({ ...anthData, chestCm: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-anth-waist" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Cintura (cm)
                    </label>
                    <input
                      id="input-anth-waist"
                      type="number"
                      step="0.5"
                      value={anthData.waistCm}
                      onChange={(e) => setAnthData({ ...anthData, waistCm: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-anth-bicep" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Bíceps (cm)
                    </label>
                    <input
                      id="input-anth-bicep"
                      type="number"
                      step="0.5"
                      value={anthData.bicepCm}
                      onChange={(e) => setAnthData({ ...anthData, bicepCm: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Notes and Evaluator */}
                <div>
                  <label htmlFor="textarea-anth-notes" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Diagnóstico y Observaciones Biomecánicas del Staff *
                  </label>
                  <textarea
                    id="textarea-anth-notes"
                    rows={3}
                    value={anthData.notes}
                    onChange={(e) => setAnthData({ ...anthData, notes: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-zinc-400">
                    Evaluador responsable:{' '}
                    <strong className="text-zinc-200">{anthData.evaluator}</strong>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-anthropometry"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all"
                  >
                    <Check className="h-4 w-4" />
                    <span>Guardar Valoración Física</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Historical checks preview */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Historial de Mediciones del Socio
              </h4>

              {(() => {
                const target = members.find((m) => m.id === selectedAnthMemberId);
                if (!target || target.records.length === 0) {
                  return (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-xs text-zinc-500">
                      Sin registros para este socio.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {target.records.map((rec) => (
                      <div key={rec.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2">
                          <span className="font-bold text-blue-400">{rec.date}</span>
                          <span className="text-[11px] text-zinc-400">{rec.evaluator}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono mb-2">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Peso:</span>
                            <span className="font-bold text-white">{rec.weightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">% Grasa:</span>
                            <span className="font-bold text-rose-400">{rec.bodyFatPct}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Músculo:</span>
                            <span className="font-bold text-emerald-400">{rec.muscleMassKg} kg</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-300 italic">&quot;{rec.notes}&quot;</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MODULE 3 - MANUAL PAYMENTS & CASH REGISTER */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Módulo de Control de Pagos Manual</h3>
                <p className="text-xs text-zinc-400">
                  Registra abonos recibidos en caja física. Actualiza inmediatamente los días restantes y el semáforo de cuenta en tiempo real.
                </p>
              </div>

              {paySuccessMsg && (
                <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>¡Abono registrado con éxito! El semáforo del socio se actualizó en tiempo real.</span>
                </div>
              )}

              <form onSubmit={handleSavePayment} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
                {/* Select Member */}
                <div>
                  <label htmlFor="select-pay-member" className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                    Socio a Registrar Pago *
                  </label>
                  <select
                    id="select-pay-member"
                    value={selectedPayMemberId}
                    onChange={(e) => setSelectedPayMemberId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (CC: {m.cedula}) - Estado: {m.status.toUpperCase()} ({m.daysRemaining} d)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-pay-amount" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Valor Abonado ($ USD) *
                    </label>
                    <input
                      id="input-pay-amount"
                      type="number"
                      step="1"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="input-pay-days" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Días a Sumar *
                    </label>
                    <input
                      id="input-pay-days"
                      type="number"
                      value={paymentData.daysAdded}
                      onChange={(e) => setPaymentData({ ...paymentData, daysAdded: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="select-pay-method" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Método de Pago *
                    </label>
                    <select
                      id="select-pay-method"
                      value={paymentData.method}
                      onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as any })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                    >
                      <option value="Efectivo">Efectivo (Recepción)</option>
                      <option value="Tarjeta">Tarjeta Débito / Crédito</option>
                      <option value="Transferencia">Transferencia Bancaria</option>
                      <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="input-pay-notes" className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Concepto o Notas del Recibo
                  </label>
                  <input
                    id="input-pay-notes"
                    type="text"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-submit-payment"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-600 transition-all"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Aplicar Pago y Actualizar Semáforo</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Status Card preview */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Estado Actual del Socio Seleccionado
              </h4>

              {(() => {
                const target = members.find((m) => m.id === selectedPayMemberId);
                if (!target) return null;

                return (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white">{target.name}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          target.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : target.status === 'expiring'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}
                      >
                        {target.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300 space-y-1">
                      <div>Plan: <strong className="text-white">{target.planName}</strong></div>
                      <div>Días Restantes: <strong className="text-blue-400 font-mono text-sm">{target.daysRemaining} días</strong></div>
                      <div>Vence el: <strong className="text-zinc-200">{target.membershipEnd}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                      <span className="text-[11px] text-zinc-400 block font-semibold mb-1">
                        Historial de Recibos ({target.payments.length})
                      </span>
                      {target.payments.slice(0, 3).map((p) => (
                        <div key={p.id} className="text-[11px] text-zinc-300 flex justify-between py-1 border-b border-zinc-900">
                          <span>{p.receiptNumber} ({p.date})</span>
                          <span className="font-mono text-emerald-400 font-bold">${p.amount.toLocaleString('es-CO')} USD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MODULE 3 - AUDIT LOGS */}
        {/* ======================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">Registro de Auditoría de Accesos (Audit Logs)</h3>
                <p className="text-xs text-zinc-400">
                  Trazabilidad forense de torniquetes y logins: Nombre, Método [Cédula/QR], Fecha/Hora, IP y Dispositivo.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {logs.length} eventos registrados
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Socio / Usuario</th>
                      <th className="p-3">Método de Acceso</th>
                      <th className="p-3">IP Origen</th>
                      <th className="p-3">Dispositivo / Terminal</th>
                      <th className="p-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/40">
                        <td className="p-3 font-mono text-zinc-300">{log.timestamp}</td>
                        <td className="p-3 font-bold text-white">{log.memberName}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] ${
                              log.method.includes('Biometría')
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/80'
                                : 'bg-zinc-800 text-zinc-200'
                            }`}
                          >
                            {log.method.includes('Biometría') && (
                              <Fingerprint className="h-3 w-3 text-blue-400" />
                            )}
                            {log.method}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{log.ip}</td>
                        <td className="p-3 text-zinc-300">{log.device}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              log.status.includes('Permitido (Activo)')
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : log.status.includes('Próximo a Vencer')
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : log.status.includes('Denegado')
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: WEBSITE CMS & CONTENT MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'content' && contentForm && (
          <div className="max-w-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Gestor de Contenido de la Página Principal</h3>
              <p className="text-xs text-zinc-400">
                Modifica titulares, anuncios de última hora, horarios de atención y datos de contacto de OA GYM.
              </p>
            </div>

            {contentSavedMsg && (
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>¡Contenido del sitio web actualizado! Los cambios son visibles de inmediato en el Home.</span>
              </div>
            )}

            <form onSubmit={handleSaveContent} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
              <div>
                <label htmlFor="input-cms-banner" className="block text-xs font-bold text-zinc-300 mb-1">
                  Barra de Anuncio Destacado (Top Banner)
                </label>
                <input
                  id="input-cms-banner"
                  type="text"
                  value={contentForm.announcement}
                  onChange={(e) => setContentForm({ ...contentForm, announcement: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label htmlFor="input-cms-headline" className="block text-xs font-bold text-zinc-300 mb-1">
                  Titular Hero Principal (H1)
                </label>
                <input
                  id="input-cms-headline"
                  type="text"
                  value={contentForm.heroHeadline}
                  onChange={(e) => setContentForm({ ...contentForm, heroHeadline: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label htmlFor="textarea-cms-subheadline" className="block text-xs font-bold text-zinc-300 mb-1">
                  Subtítulo Descriptivo Hero
                </label>
                <textarea
                  id="textarea-cms-subheadline"
                  rows={2}
                  value={contentForm.heroSubheadline}
                  onChange={(e) => setContentForm({ ...contentForm, heroSubheadline: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-cms-phone" className="block text-xs font-bold text-zinc-300 mb-1">
                    Teléfono Recepción
                  </label>
                  <input
                    id="input-cms-phone"
                    type="text"
                    value={contentForm.phone}
                    onChange={(e) => setContentForm({ ...contentForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label htmlFor="input-cms-address" className="block text-xs font-bold text-zinc-300 mb-1">
                    Dirección de la Sede
                  </label>
                  <input
                    id="input-cms-address"
                    type="text"
                    value={contentForm.address}
                    onChange={(e) => setContentForm({ ...contentForm, address: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="input-cms-weekdays" className="block text-xs font-bold text-zinc-300 mb-1">
                  Horario de Atención (Lunes a Viernes)
                </label>
                <input
                  id="input-cms-weekdays"
                  type="text"
                  value={contentForm.scheduleWeekdays}
                  onChange={(e) => setContentForm({ ...contentForm, scheduleWeekdays: e.target.value })}
                  placeholder="Lunes a Viernes: 5:00 AM - 9:00 PM"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Atención exclusiva de Lunes a Viernes (Sábados, Domingos y Festivos cerrados).
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-save-cms-content"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Publicar Cambios en la Web</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* ADD USER MODAL */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-500" />
                Registrar Nuevo Socio & Generar Carnet Digital
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterUser} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-input-name" className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    id="modal-input-name"
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="Ej: Daniel Fernando Silva"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="modal-input-cedula" className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Cédula / Documento (Sin puntos) *
                  </label>
                  <input
                    id="modal-input-cedula"
                    type="text"
                    inputMode="numeric"
                    value={newUserData.cedula}
                    onChange={(e) => setNewUserData({ ...newUserData, cedula: e.target.value })}
                    placeholder="Ej: 1018992341"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="modal-input-phone" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    id="modal-input-phone"
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="312 345 6789"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="modal-input-birthdate" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    id="modal-input-birthdate"
                    type="date"
                    value={newUserData.birthDate}
                    onChange={(e) => setNewUserData({ ...newUserData, birthDate: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="modal-select-blood" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Grupo Sanguíneo RH
                  </label>
                  <select
                    id="modal-select-blood"
                    value={newUserData.bloodType}
                    onChange={(e) => setNewUserData({ ...newUserData, bloodType: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-select-plan" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Plan de Entrenamiento Suscrito *
                  </label>
                  <select
                    id="modal-select-plan"
                    value={newUserData.planId}
                    onChange={(e) => setNewUserData({ ...newUserData, planId: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.formattedPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-input-initial-days" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Días Pagados Iniciales *
                  </label>
                  <input
                    id="modal-input-initial-days"
                    type="number"
                    value={newUserData.initialDays}
                    onChange={(e) => setNewUserData({ ...newUserData, initialDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-input-emergency-contact" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Contacto de Emergencia
                  </label>
                  <input
                    id="modal-input-emergency-contact"
                    type="text"
                    value={newUserData.emergencyContact}
                    onChange={(e) => setNewUserData({ ...newUserData, emergencyContact: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label htmlFor="modal-input-emergency-phone" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Teléfono Emergencia
                  </label>
                  <input
                    id="modal-input-emergency-phone"
                    type="tel"
                    value={newUserData.emergencyPhone}
                    onChange={(e) => setNewUserData({ ...newUserData, emergencyPhone: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  id="btn-confirm-register-user"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/40"
                >
                  Registrar Socio y Generar QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
