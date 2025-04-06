import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './App.css'
import './fonts.css'

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
      main: '#00a2ff',
      light: '#33b4ff',
      dark: '#0071b2',
    },
    secondary: {
      main: '#ff3366',
      light: '#ff6b91',
      dark: '#b22347',
    },
    background: {
      default: '#000000',
      paper: '#000000',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#000000',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&.data-card': {
            background: 'linear-gradient(45deg, #000000 30%, #111111 90%)',
            boxShadow: '0 0 20px rgba(0, 162, 255, 0.15)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 0 30px rgba(0, 162, 255, 0.25)',
              borderColor: '#00a2ff',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
          '&.MuiButton-contained': {
            background: 'linear-gradient(45deg, #00a2ff 30%, #0071b2 90%)',
            boxShadow: '0 0 10px rgba(0, 162, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #33b4ff 30%, #00a2ff 90%)',
              boxShadow: '0 0 15px rgba(0, 162, 255, 0.4)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 30px rgba(0, 162, 255, 0.15)',
          },
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
        <div className="flex h-screen overflow-hidden bg-black">
          <Sidebar collapsed={sidebarCollapsed} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="flex flex-col flex-1">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <div className="h-full bg-black ml-6">
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
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
