import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/tiptap/styles.css'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MantineProvider defaultColorScheme="auto">
      <App/>
    </MantineProvider>
  </BrowserRouter>,
)
