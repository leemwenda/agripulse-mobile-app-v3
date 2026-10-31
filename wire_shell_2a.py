import pathlib
P = 'src/components/layout.tsx'
s = pathlib.Path(P).read_text()

def sub(old, new):
    global s
    assert s.count(old) == 1, f"expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    s = s.replace(old, new)

def cut(start, end_marker, new):
    global s
    assert s.count(start) == 1, f"start {start[:50]!r} found {s.count(start)}; nothing written"
    i = s.index(start)
    assert end_marker in s[i:], f"end {end_marker[:50]!r} not found; nothing written"
    j = s.index(end_marker, i)
    s = s[:i] + new + s[j:]

# 1. PhoneFrame: plain full-height container
cut("export function PhoneFrame", "let unreadCache", '''export function PhoneFrame({ children }: { children: ReactNode }) {
  // Full-screen adaptive container. Layout (rail, columns) is decided by the children.
  return <div className="flex h-dvh w-full overflow-hidden bg-slate-100">{children}</div>;
}

''')

# 2. Bottom bar only on phones
sub('"sticky bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"',
    '"sticky bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"')

# 3. Side rail for tablets, inserted before AuthedShell
sub("export function AuthedShell(", '''function SideRail() {
  const { user } = useApp();
  const hideFarm = user?.role === 'buyer' || user?.role === 'vet';
  const tabs = TABS.filter((t) => !(hideFarm && t.to === '/farm'));
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/brand-logo-source.png" alt="" className="keep-white h-9 w-9 rounded-lg bg-white object-contain" />
        <span className="text-base font-extrabold text-slate-900">AgriPulse</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-100',
              )
            }
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-200 p-4">
        <RoleBadge />
      </div>
    </aside>
  );
}

export function AuthedShell(''')

# 4. AuthedShell body
cut("    <PhoneFrame>\n      <OfflineBanner />", "export function AuthLayout", '''    <PhoneFrame>
      <SideRail />
      <div className="relative flex min-w-0 flex-1 flex-col bg-slate-50">
        <OfflineBanner />
        <DemoModeBanner />
        <TopBar title={title} onBack={showBack || !isTabRoot ? () => navigate(-1) : undefined} right={right} />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
        <BottomNav />
        <ToastStack />
      </div>
    </PhoneFrame>
  );
}

''')

# 5. AuthLayout: centred column on wide screens
cut("export function AuthLayout", "export function RoleBadge", '''export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="mx-auto flex min-w-0 w-full flex-col bg-slate-50 md:max-w-lg md:border-x md:border-slate-200 md:shadow-xl">
        <div className="flex-1 overflow-y-auto">
          <ToastStack />
          {children}
        </div>
      </div>
    </PhoneFrame>
  );
}

''')

pathlib.Path(P).write_text(s)
print("wired")
