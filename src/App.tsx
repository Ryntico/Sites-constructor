import './App.css'
import { Header } from './components/header/Header.tsx'
import { AppRouter } from './router/AppRouter.tsx'
import { selectAuth } from "./store/slices/authSlice";
import { useAppSelector } from "./store/hooks";

export function App() {
  const {user } = useAppSelector(selectAuth)

  return (
    <>
      {user && <Header/>}
      <AppRouter />
    </>
  )
}
