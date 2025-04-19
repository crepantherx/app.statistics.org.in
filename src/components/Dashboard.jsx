import { useState } from 'react';
import { Typography, Grid, Paper, Box, Button, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChatIcon from '@mui/icons-material/Chat';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const activityData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1000 },
];

const pieData = [
  { name: 'CSV Files', value: 45 },
  { name: 'JSON Files', value: 25 },
  { name: 'Excel Files', value: 20 },
  { name: 'Parquet Files', value: 10 },
];

const COLORS = ['#00a2ff', '#33b4ff', '#0071b2', '#ff3366'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentDatasets] = useState([
    { id: 1, name: 'Sales Data 2023', type: 'CSV', date: '2023-12-15', size: '2.4 MB' },
    { id: 2, name: 'Customer Feedback', type: 'JSON', date: '2023-12-10', size: '1.8 MB' },
    { id: 3, name: 'Product Inventory', type: 'Excel', date: '2023-12-05', size: '3.2 MB' },
  ]);

  const features = [
    { 
      title: 'Upload Data', 
      description: 'Upload your data files or connect to external data sources', 
      icon: <UploadFileIcon sx={{ fontSize: 40 }} />, 
      path: '/upload',
      color: '#00a2ff'
    },
    { 
      title: 'Data Analysis', 
      description: 'Get comprehensive statistical analysis of your data', 
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />, 
      path: '/analysis',
      color: '#33b4ff'
    },
    { 
      title: 'Visualizations', 
      description: 'Create beautiful charts and graphs from your data', 
      icon: <BarChartIcon sx={{ fontSize: 40 }} />, 
      path: '/visualization',
      color: '#0071b2'
    },
    { 
      title: 'AI Insights', 
      description: 'Get AI-powered insights and predictions from your data', 
      icon: <InsightsIcon sx={{ fontSize: 40 }} />, 
      path: '/insights',
      color: '#ff3366'
    },
    { 
      title: 'Chat Interface', 
      description: 'Ask questions about your data using natural language', 
      icon: <ChatIcon sx={{ fontSize: 40 }} />, 
      path: '/chat',
      color: '#ff6b91'
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '0 0 10px rgba(0, 162, 255, 0.5)'
      }}>
        Welcome to Deep Statistics
      </Typography> */}
      <Typography variant="subtitle1" sx={{ 
        color: 'text.secondary',
        mb: 4,
        textShadow: '0 0 8px rgba(0, 162, 255, 0.3)'
      }}>
        AI-powered data analysis platform
      </Typography>

      {/* Quick Start */}
      <Paper className="data-card" sx={{ mb: 4, p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'start', md: 'center' }, 
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Quick Start
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload your data to get started with automated analysis
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/upload')}
            sx={{ mt: { xs: 2, md: 0 } }}
          >
            Upload Data
          </Button>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(45deg, #000000 30%, #111111 90%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: feature.color,
                    boxShadow: `0 0 20px ${feature.color}40`,
                    '& .feature-icon': {
                      color: feature.color,
                    }
                  }
                }}
              >
                <CardContent>
                  <Box 
                    className="feature-icon"
                    sx={{ 
                      mb: 2,
                      color: 'text.secondary',
                      transition: 'color 0.3s ease-in-out'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(feature.path)}
                    sx={{ color: feature.color }}
                  >
                    Explore
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Datasets */}
      <Paper className="data-card" sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Recent Datasets
        </Typography>
        {recentDatasets.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ 
              minWidth: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Name</th>
                  <th style={{ 
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Type</th>
                  <th style={{ 
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Date</th>
                  <th style={{ 
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Size</th>
                  <th style={{ 
                    padding: '12px 24px',
                    textAlign: 'right',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDatasets.map((dataset) => (
                  <tr key={dataset.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <td style={{ padding: '16px 24px' }}>{dataset.name}</td>
                    <td style={{ padding: '16px 24px' }}>{dataset.type}</td>
                    <td style={{ padding: '16px 24px' }}>{dataset.date}</td>
                    <td style={{ padding: '16px 24px' }}>{dataset.size}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <Button 
                        size="small" 
                        onClick={() => navigate('/analysis')}
                        sx={{ color: '#00a2ff' }}
                      >
                        Analyze
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              No recent datasets found
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={() => navigate('/upload')}
            >
              Upload Your First Dataset
            </Button>
          </Box>
        )}
      </Paper>

      {/* Dashboard Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="data-card" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Activity Overview
            </Typography>
            <Box sx={{ height: 400, width:600 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000000',
                      borderColor: '#00a2ff',
                      border: '1px solid',
                      borderRadius: '4px',
                      boxShadow: '0 0 10px rgba(0, 162, 255, 0.2)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00a2ff" 
                    fill="#00a2ff" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="data-card" sx={{ p: 3, height: '100%'}}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Data Sources
            </Typography>
            <Box sx={{ height: 400, width:600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000000',
                      borderColor: '#00a2ff',
                      border: '1px solid',
                      borderRadius: '4px',
                      boxShadow: '0 0 10px rgba(0, 162, 255, 0.2)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;