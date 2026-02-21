import { MainLayout } from './components/MainLayout';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <MainLayout />
      <Analytics />
    </>
  );
}

export default App;
