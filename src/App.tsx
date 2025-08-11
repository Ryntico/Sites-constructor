import './App.css'
import { Header } from './components/header/Header.tsx'
import { AppRouter } from './router/AppRouter.tsx'

export function App() {
  return (
    <>
      <Header />
      <AppRouter />
    </>
  )
}
