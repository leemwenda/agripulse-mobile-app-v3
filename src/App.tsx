import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { UpdateGate } from './components/UpdateGate';
import { SplashScreen, LoginScreen, RegisterScreen } from './screens/Auth';
import { WelcomeScreen } from './screens/Welcome';
import { JourneyScreen } from './screens/Journey';
import { HomeScreen } from './screens/Home';
import { FarmListScreen, AnimalDetailScreen } from './screens/Farm';
import { RegisterAnimalScreen } from './screens/RegisterAnimal';
import { MilkScreen, HealthScreen, BreedingScreen, FinanceScreen } from './screens/Records';
import { AIAdvisorScreen } from './screens/AIAdvisor';
import { PassportScreen } from './screens/Passport';
import { WorkersScreen } from './screens/Workers';
import { HelpScreen } from './screens/Help';
import { EditAnimalScreen } from './screens/EditAnimal';
import { WebsiteOnlyScreen } from './screens/WebsiteOnly';
import { MoreScreen, NotificationsScreen, ProfileScreen, SettingsScreen, PlaceholderScreen } from './screens/More';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { mode, user } = useApp();
  if (mode === 'checking') return <SplashScreen />;
  if (mode === 'signed-out') return <Navigate to="/welcome" replace />;
  if (user?.role === 'buyer' || user?.role === 'vet') return <WebsiteOnlyScreen />;
  return children;
}

function PublicOnlyRoute({ children }: { children: React.ReactElement }) {
  const { mode } = useApp();
  if (mode === 'checking') return <SplashScreen />;
  if (mode === 'live' || mode === 'demo') return <Navigate to="/home" replace />;
  return children;
}

function Root() {
  const { mode } = useApp();
  if (mode === 'checking') return <SplashScreen />;
  return <Navigate to={mode === 'signed-out' ? '/welcome' : '/home'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/welcome" element={<PublicOnlyRoute><WelcomeScreen /></PublicOnlyRoute>} />
      <Route path="/journey" element={<PublicOnlyRoute><JourneyScreen /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginScreen /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterScreen /></PublicOnlyRoute>} />

      <Route path="/home" element={<PrivateRoute><HomeScreen /></PrivateRoute>} />

      <Route path="/farm" element={<PrivateRoute><FarmListScreen /></PrivateRoute>} />
      <Route path="/farm/new" element={<PrivateRoute><RegisterAnimalScreen /></PrivateRoute>} />
      <Route path="/farm/milk" element={<PrivateRoute><MilkScreen /></PrivateRoute>} />
      <Route path="/farm/health" element={<PrivateRoute><HealthScreen /></PrivateRoute>} />
      <Route path="/farm/breeding" element={<PrivateRoute><BreedingScreen /></PrivateRoute>} />
      <Route path="/farm/finance" element={<PrivateRoute><FinanceScreen /></PrivateRoute>} />
      <Route path="/farm/:id/edit" element={<PrivateRoute><EditAnimalScreen /></PrivateRoute>} />
      <Route path="/farm/:id" element={<PrivateRoute><AnimalDetailScreen /></PrivateRoute>} />

      <Route path="/ai" element={<PrivateRoute><AIAdvisorScreen /></PrivateRoute>} />

      <Route path="/passport/:agripulseId" element={<PrivateRoute><PassportScreen /></PrivateRoute>} />

      <Route path="/more" element={<PrivateRoute><MoreScreen /></PrivateRoute>} />
      <Route path="/more/notifications" element={<PrivateRoute><NotificationsScreen /></PrivateRoute>} />
      <Route path="/more/profile" element={<PrivateRoute><ProfileScreen /></PrivateRoute>} />
      <Route path="/more/settings" element={<PrivateRoute><SettingsScreen /></PrivateRoute>} />
      <Route path="/more/reports" element={<PrivateRoute><PlaceholderScreen title="Reports" description="Exportable milk, health, breeding and financial reports from the live backend will appear here." /></PrivateRoute>} />
      <Route path="/more/workers" element={<PrivateRoute><WorkersScreen /></PrivateRoute>} />
      <Route path="/more/help" element={<PrivateRoute><HelpScreen /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <UpdateGate />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
