'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Users, Stethoscope, Building2, Crown, LayoutDashboard,
  UserCheck, Calendar, FileText, CreditCard, Settings, LogOut,
  BarChart2, MessageSquare, Zap, ClipboardList, DollarSign, Clock,
  Sun, Moon, PanelLeftClose, PanelLeftOpen, Menu, X,
  ChevronDown, ChevronRight,
  Activity, Target, UserCog, Shield, BadgeCheck,
  Flag, RefreshCw, Receipt, Tag, Ticket, AlertOctagon,
  ThumbsUp, Bell, Mail, LayoutTemplate, Megaphone,
  Globe, BookOpen, HelpCircle, Star, Image,
  ScrollText, Plug, SlidersHorizontal, Lock, Database,
  FileWarning, Clipboard, Briefcase, AlertTriangle, Sparkles,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type Role = 'super_admin' | 'consultant' | 'doctor' | 'hospital';

/* ── Pending badge counts (mock data) ── */
const BADGES: Record<string, number> = {
  '/dashboard/super-admin/verification/doctor-approvals': 8,
  '/dashboard/super-admin/verification/hospital-approvals': 3,
  '/dashboard/super-admin/verification/profile-changes': 5,
  '/dashboard/super-admin/verification/expiring-docs': 7,
  '/dashboard/super-admin/support/tickets': 5,
  '/dashboard/super-admin/support/complaints': 4,
  '/dashboard/super-admin/payments': 2,
};

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

/* ── Super Admin grouped nav ── */
const SUPER_ADMIN_NAV: NavSection[] = [
  {
    title: 'Overview',
    defaultOpen: true,
    items: [
      { label: 'Dashboard',      icon: LayoutDashboard, href: '/dashboard/super-admin' },
      { label: 'Action Centre',  icon: Target,          href: '/dashboard/super-admin/action-centre' },
      { label: 'Live Activity',  icon: Activity,        href: '/dashboard/super-admin/live-activity' },
    ],
  },
  {
    title: 'Operations',
    defaultOpen: true,
    items: [
      { label: 'Consultation Leads', icon: ClipboardList, href: '/dashboard/super-admin/leads' },
      { label: 'Appointments',       icon: Calendar,      href: '/dashboard/super-admin/appointments' },
      { label: 'Follow-ups',         icon: Clock,         href: '/dashboard/super-admin/follow-ups' },
    ],
  },
  {
    title: 'Network',
    defaultOpen: false,
    items: [
      { label: 'Doctors',      icon: Stethoscope, href: '/dashboard/super-admin/doctors' },
      { label: 'Hospitals',    icon: Building2,   href: '/dashboard/super-admin/hospitals' },
      { label: 'Specialities', icon: Stethoscope, href: '/dashboard/super-admin/specialities' },
    ],
  },
  {
    title: 'Users & Team',
    defaultOpen: false,
    items: [
      { label: 'All Patients',        icon: Users,     href: '/dashboard/super-admin/patients' },
      { label: 'Employees',           icon: Briefcase, href: '/dashboard/super-admin/employees' },
      { label: 'Roles & Permissions', icon: Shield,    href: '/dashboard/super-admin/roles' },
    ],
  },
  {
    title: 'Verification',
    defaultOpen: false,
    items: [
      { label: 'Doctor Approvals',    icon: BadgeCheck,   href: '/dashboard/super-admin/verification/doctor-approvals' },
      { label: 'Hospital Approvals',  icon: Building2,    href: '/dashboard/super-admin/verification/hospital-approvals' },
      { label: 'Profile Changes',     icon: UserCog,      href: '/dashboard/super-admin/verification/profile-changes' },
      { label: 'Expiring Documents',  icon: FileWarning,  href: '/dashboard/super-admin/verification/expiring-docs' },
      { label: 'Flagged Profiles',    icon: Flag,         href: '/dashboard/super-admin/verification/flagged' },
    ],
  },
  {
    title: 'Revenue',
    defaultOpen: false,
    items: [
      { label: 'Plans & Subscriptions', icon: Zap,         href: '/dashboard/super-admin/subscriptions' },
      { label: 'Payments',              icon: DollarSign,  href: '/dashboard/super-admin/payments' },
      { label: 'Refunds',               icon: Receipt,     href: '/dashboard/super-admin/refunds' },
      { label: 'Invoices',              icon: FileText,    href: '/dashboard/super-admin/invoices' },
      { label: 'Coupons & Discounts',   icon: Tag,         href: '/dashboard/super-admin/coupons' },
    ],
  },
  {
    title: 'Support',
    defaultOpen: false,
    items: [
      { label: 'Support Tickets', icon: Ticket,        href: '/dashboard/super-admin/support/tickets' },
      { label: 'Complaints',      icon: AlertOctagon,  href: '/dashboard/super-admin/support/complaints' },
      { label: 'Disputes',        icon: AlertTriangle, href: '/dashboard/super-admin/support/disputes' },
      { label: 'Feedback',        icon: ThumbsUp,      href: '/dashboard/super-admin/support/feedback' },
    ],
  },
  {
    title: 'Communication',
    defaultOpen: false,
    items: [
      { label: 'Push Notifications', icon: Bell,           href: '/dashboard/super-admin/communication/notifications' },
      { label: 'Email Templates',    icon: Mail,           href: '/dashboard/super-admin/communication/email' },
      { label: 'WhatsApp Templates', icon: MessageSquare,  href: '/dashboard/super-admin/communication/whatsapp' },
      { label: 'SMS Templates',      icon: LayoutTemplate, href: '/dashboard/super-admin/communication/sms' },
      { label: 'Campaigns',          icon: Megaphone,      href: '/dashboard/super-admin/communication/campaigns' },
    ],
  },
  {
    title: 'System',
    defaultOpen: false,
    items: [
      { label: 'Reports & Analytics', icon: BarChart2,  href: '/dashboard/super-admin/reports' },
      { label: 'Audit Logs',          icon: ScrollText, href: '/dashboard/super-admin/audit-log' },
      { label: 'Website CMS',         icon: Globe,      href: '/dashboard/super-admin/content/cms' },
      { label: 'Blog Manager',        icon: BookOpen,   href: '/dashboard/super-admin/content/blog' },
      { label: 'FAQs',                icon: HelpCircle, href: '/dashboard/super-admin/content/faqs' },
      { label: 'Testimonials',        icon: Star,       href: '/dashboard/super-admin/content/testimonials' },
      { label: 'Banners & Media',     icon: Image,      href: '/dashboard/super-admin/content/banners' },
      { label: 'Integrations',        icon: Plug,       href: '/dashboard/super-admin/integrations' },
      { label: 'Security',            icon: Lock,       href: '/dashboard/super-admin/security' },
      { label: 'Backup Logs',         icon: Database,   href: '/dashboard/super-admin/backups' },
    ],
  },
];

/* ── Flat nav for other roles ── */
const NAV_ITEMS: Record<Exclude<Role, 'super_admin'>, NavItem[]> = {
  consultant: [
    { label: 'Dashboard',       icon: LayoutDashboard, href: '/dashboard/consultant' },
    { label: 'My Leads',        icon: ClipboardList,   href: '/dashboard/consultant/leads' },
    { label: 'Patient Cases',   icon: Users,           href: '/dashboard/consultant/patients' },
    { label: 'Recommendations', icon: MessageSquare,   href: '/dashboard/consultant/recommendations' },
    { label: 'Calendar',        icon: Calendar,        href: '/dashboard/consultant/calendar' },
    { label: 'Reports',         icon: FileText,        href: '/dashboard/consultant/reports' },
  ],
  doctor: [
    { label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard/doctor' },
    { label: 'Appointments', icon: Calendar,        href: '/dashboard/doctor/appointments' },
    { label: 'My Patients',  icon: Users,           href: '/dashboard/doctor/patients' },
    { label: 'Profile',      icon: UserCheck,       href: '/dashboard/doctor/profile' },
    { label: 'Availability', icon: Clock,           href: '/dashboard/doctor/availability' },
    { label: 'Earnings',     icon: DollarSign,      href: '/dashboard/doctor/earnings' },
    { label: 'Promote Profile', icon: Sparkles,      href: '/dashboard/doctor/promote' },
  ],
  hospital: [
    { label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard/hospital' },
    { label: 'Doctors',      icon: Stethoscope,     href: '/dashboard/hospital/doctors' },
    { label: 'Appointments', icon: Calendar,        href: '/dashboard/hospital/appointments' },
    { label: 'OPD Timings',  icon: FileText,        href: '/dashboard/hospital/opd' },
    { label: 'Reports',      icon: BarChart2,       href: '/dashboard/hospital/reports' },
    { label: 'Payments',     icon: CreditCard,      href: '/dashboard/hospital/payments' },
    { label: 'Promote Profile', icon: Sparkles,      href: '/dashboard/hospital/promote' },
  ],
};

const ROLE_META: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  super_admin: { label: 'Super Admin',  icon: Crown,       color: 'text-amber-400' },
  consultant:  { label: 'Consultant',  icon: Users,       color: 'text-violet-400' },
  doctor:      { label: 'Doctor',      icon: Stethoscope, color: 'text-sky-400' },
  hospital:    { label: 'Hospital',    icon: Building2,   color: 'text-emerald-400' },
};

interface PanelSidebarProps { role: Role; userName?: string; }

/* ── Utility: is this nav item active? ── */
function isActive(itemHref: string, pathname: string, basePath: string): boolean {
  if (itemHref === basePath) return pathname === basePath;
  return pathname === itemHref || pathname.startsWith(itemHref + '/');
}

/* ── Single flat nav link ── */
function NavLink({
  item, collapsed, pathname, basePath, closeMobile,
}: {
  item: NavItem; collapsed: boolean; pathname: string; basePath: string; closeMobile: () => void;
}) {
  const Icon = item.icon;
  const active = isActive(item.href, pathname, basePath);
  const badge = BADGES[item.href];

  return (
    <Link
      href={item.href}
      onClick={closeMobile}
      title={collapsed ? item.label : undefined}
      className={`panel-sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-0.5 group relative ${
        collapsed ? 'lg:justify-center lg:px-2' : ''
      } ${active ? 'sidebar-active' : ''}`}
      style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
    >
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: active ? 'rgba(18,122,106,0.15)' : 'transparent' }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: active ? '#25B89A' : 'var(--text-muted)' }} />
      </span>
      <span className={`panel-sidebar-label flex-1 whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
        {item.label}
      </span>
      {badge != null && !collapsed && (
        <span className="panel-sidebar-label text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 flex-shrink-0">
          {badge}
        </span>
      )}
      {badge != null && collapsed && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center lg:flex hidden">
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ── Collapsible section for super admin ── */
function NavSection({
  section, collapsed, pathname, basePath, closeMobile,
}: {
  section: NavSection; collapsed: boolean; pathname: string; basePath: string; closeMobile: () => void;
}) {
  const hasActive = section.items.some(item => isActive(item.href, pathname, basePath));
  const [open, setOpen] = useState(section.defaultOpen ?? hasActive);
  const totalBadge = section.items.reduce((sum, item) => sum + (BADGES[item.href] ?? 0), 0);

  return (
    <div className="mb-1">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5 mb-0.5 ${
          collapsed ? 'lg:justify-center' : ''
        }`}
      >
        {!collapsed && (
          <>
            <span className="text-[9px] font-black uppercase tracking-widest flex-1 text-left" style={{ color: 'var(--text-muted)' }}>
              {section.title}
            </span>
            {totalBadge > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                {totalBadge}
              </span>
            )}
            {open
              ? <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              : <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            }
          </>
        )}
        {collapsed && (
          <span className="w-4 h-px rounded-full" style={{ background: 'var(--border-color)' }} />
        )}
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            key="section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {section.items.map(item => (
              <NavLink
                key={item.href + item.label}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
                basePath={basePath}
                closeMobile={closeMobile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PanelSidebar({ role, userName = 'ICC Admin' }: PanelSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;
  const roleBasePath = `/dashboard/${role.replace('_', '-')}`;
  const closeMobile = () => setMobileOpen(false);

  /* ── Preserve sidebar scroll position across navigations ── */
  const navRef = useRef<HTMLElement>(null);
  const savedScrollRef = useRef<number>(0);

  // Save scroll BEFORE pathname changes
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    savedScrollRef.current = nav.scrollTop;
  });

  // Restore scroll AFTER paint when pathname changes
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = savedScrollRef.current;
    // Use requestAnimationFrame to restore after layout/paint
    const raf = requestAnimationFrame(() => {
      nav.scrollTop = saved;
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);


  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="panel-mobile-menu fixed left-4 top-4 z-[70] h-10 w-10 items-center justify-center rounded-2xl border shadow-lg lg:hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        aria-label="Open panel sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          onClick={closeMobile}
          className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-sm lg:hidden"
          aria-label="Close panel sidebar overlay"
        />
      )}

      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={`panel-sidebar ${collapsed ? 'panel-sidebar-collapsed' : ''} ${
          mobileOpen ? 'panel-sidebar-mobile-open' : ''
        } flex-shrink-0 flex flex-col border-r overflow-hidden relative`}
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)', height: '100vh', position: 'sticky', top: 0 }}
      >
        {/* ── Logo ── */}
        <div className="px-4 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Link
              href={roleBasePath}
              onClick={closeMobile}
              className={`flex min-w-0 flex-1 items-center gap-3 group ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform bg-white relative">
                <img src="/logo.png" alt="ICC Logo" className="w-full h-full object-contain" />
              </div>
              <div className={`panel-sidebar-label min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                <span className="font-extrabold text-base tracking-wider block leading-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                  INDIA CARE
                </span>
                <span className="text-[10px] font-black tracking-[0.22em] block whitespace-nowrap" style={{ color: '#25B89A' }}>
                  CONTROL PANEL
                </span>
              </div>
            </Link>
            {/* Mobile close */}
            <button
              type="button"
              onClick={closeMobile}
              className="panel-sidebar-label flex h-9 w-9 items-center justify-center rounded-xl border lg:hidden"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={() => setCollapsed(v => !v)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:border-brand lg:flex"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Role badge ── */}
        <div
          className={`mx-3 my-3 rounded-xl border p-3 flex-shrink-0 ${collapsed ? 'lg:mx-2 lg:px-2' : ''}`}
          style={{ background: 'rgba(18,122,106,0.08)', borderColor: 'rgba(18,122,106,0.18)' }}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,122,106,0.12)' }}>
              <RoleIcon className={`w-4 h-4 ${meta.color}`} />
            </div>
            <div className={`panel-sidebar-label min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{userName}</p>
              <p className="text-[10px] font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>{meta.label}</p>
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav ref={navRef} className="flex-1 px-2 pb-3 overflow-y-auto panel-scroll">
          {role === 'super_admin' ? (
            SUPER_ADMIN_NAV.map(section => (
              <NavSection
                key={section.title}
                section={section}
                collapsed={collapsed}
                pathname={pathname}
                basePath={roleBasePath}
                closeMobile={closeMobile}
              />
            ))
          ) : (
            <div className="pt-1">
              <p className={`panel-sidebar-label text-[9px] font-black uppercase tracking-widest px-3 mb-2 ${collapsed ? 'lg:hidden' : ''}`} style={{ color: 'var(--text-muted)' }}>
                Navigation
              </p>
              {NAV_ITEMS[role as Exclude<Role, 'super_admin'>].map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  basePath={roleBasePath}
                  closeMobile={closeMobile}
                />
              ))}
            </div>
          )}
        </nav>

        {/* ── Footer: theme + settings + logout ── */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`panel-sidebar-link w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-1 justify-between ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: theme === 'dark' ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.12)' }}
              >
                {theme === 'dark'
                  ? <Sun className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                  : <Moon className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                }
              </span>
              <span className={`panel-sidebar-label ${collapsed ? 'lg:hidden' : ''}`} style={{ color: 'var(--text-primary)' }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div
              className={`panel-sidebar-label relative w-8 h-4 rounded-full flex-shrink-0 transition-colors duration-300 ${collapsed ? 'lg:hidden' : ''}`}
              style={{ background: theme === 'dark' ? 'rgba(99,102,241,0.35)' : 'rgba(251,191,36,0.4)' }}
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 0 : 16 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full shadow-sm"
                style={{ background: theme === 'dark' ? '#818cf8' : '#f59e0b' }}
              />
            </div>
          </button>

          <Link
            href={`/dashboard/${role.replace('_', '-')}/settings`}
            onClick={closeMobile}
            className={`panel-sidebar-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-1 ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="w-7 h-7 rounded-lg flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 flex-shrink-0" />
            </span>
            <span className={`panel-sidebar-label ${collapsed ? 'lg:hidden' : ''}`}>Settings</span>
          </Link>

          <Link
            href="/login"
            onClick={closeMobile}
            className={`panel-sidebar-link flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:text-red-400 hover:bg-red-500/5 ${
              collapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="w-7 h-7 rounded-lg flex items-center justify-center">
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            </span>
            <span className={`panel-sidebar-label ${collapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
