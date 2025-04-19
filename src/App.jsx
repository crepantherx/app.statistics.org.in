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
})

function App() {
  const [dataSource, setDataSource] = useState(null)
  const [currentData, setCurrentData] = useState(null)
  const [statistics, setStatistics] = useState(null)
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <div className="flex h-screen bg-dark overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-20 overflow-y-auto bg-dark p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<DataUpload setDataSource={setDataSource} setCurrentData={setCurrentData} />} />
                <Route path="/analysis" element={<DataAnalysis data={currentData} setStatistics={setStatistics} />} />
                <Route path="/visualization" element={<DataVisualization data={currentData} statistics={statistics} />} />
                <Route path="/insights" element={<AIInsights data={currentData} statistics={statistics} />} />
                <Route path="/chat" element={<ChatInterface data={currentData} statistics={statistics} />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
