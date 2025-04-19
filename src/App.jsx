import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './App.css'

// Import components
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DataUpload from './components/DataUpload'
import DataAnalysis from './components/DataAnalysis'
import DataVisualization from './components/DataVisualization'
import AIInsights from './components/AIInsights'
import ChatInterface from './components/ChatInterface'

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          minHeight: '48px',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '48px !important',
          padding: '0 16px',
        },
      },
    },
  },
})

function App() {
  const [dataSource, setDataSource] = useState(null)
  const [currentData, setCurrentData] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <div className="flex h-screen overflow-hidden bg-[#121212]">
          <Sidebar collapsed={sidebarCollapsed} />
          <div className="flex flex-col flex-1">
            <Navbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<DataUpload setDataSource={setDataSource} setCurrentData={setCurrentData} />} />
                <Route path="/analysis" element={<DataAnalysis data={currentData} setStatistics={setStatistics} />} />
                <Route path="/visualization" element={<DataVisualization data={currentData} statistics={statistics} />} />
                <Route path="/insights" element={<AIInsights data={currentData} statistics={statistics} />} />
                <Route path="/chat" element={<ChatInterface data={currentData} statistics={statistics} />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
