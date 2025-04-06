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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

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
      color: '#6366f1'
    },
    { 
      title: 'Data Analysis', 
      description: 'Get comprehensive statistical analysis of your data', 
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />, 
      path: '/analysis',
      color: '#8b5cf6'
    },
    { 
      title: 'Visualizations', 
      description: 'Create beautiful charts and graphs from your data', 
      icon: <BarChartIcon sx={{ fontSize: 40 }} />, 
      path: '/visualization',
      color: '#ec4899'
    },
    { 
      title: 'AI Insights', 
      description: 'Get AI-powered insights and predictions from your data', 
      icon: <InsightsIcon sx={{ fontSize: 40 }} />, 
      path: '/insights',
      color: '#14b8a6'
    },
    { 
      title: 'Chat Interface', 
      description: 'Ask questions about your data using natural language', 
      icon: <ChatIcon sx={{ fontSize: 40 }} />, 
      path: '/chat',
      color: '#f97316'
    },
  ];

  return (
    <div className="px-6 py-0" style={{ margin: '25px' }}>
      {/* <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          fontSize: '2rem',
          lineHeight: 1.2,
          fontWeight: 'bold',
          mt: 0,
        }}
      >
        Welcome to Deep Statistics
      </Typography> */}
      {/* <Typography 
        variant="subtitle1" 
        className="text-gray-400" 
        sx={{ 
          lineHeight: 1.2,
          mb: 3
        }}
      >
        Your AI-powered data analysis platform
      </Typography> */}

      {/* Quick Start */}
      <Paper className="p-6 mb-4" style={{ margin: '25px', padding: '25px' }}>
        <Box className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <Box>
            <Typography variant="h5" className="font-bold mb-2">
              Quick Start
            </Typography>
            <Typography variant="body1" className="text-gray-400">
              Upload your data to get started with automated analysis
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/upload')}
            className="mt-4 md:mt-0"
          >
            Upload Data
          </Button>
        </Box>

        <Grid container spacing={3} style={{ margin: '25px' }}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card 
                className="data-card h-full" 
                sx={{ 
                  '&:hover': { 
                    borderColor: feature.color,
                    '& .feature-icon': {
                      color: feature.color,
                    }
                  } 
                }}
              >
                <CardContent>
                  <Box 
                    className="feature-icon mb-4 transition-colors" 
                    sx={{ color: 'text.secondary' }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" className="font-bold mb-2">
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
      <Paper className="data-card p-6" style={{ padding: '25px', margin: '25px' }}>
        <Typography variant="h6" className="font-bold mb-4">
          Recent Datasets
        </Typography>
        {recentDatasets.length > 0 ? (
          <Box className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentDatasets.map((dataset) => (
                  <tr key={dataset.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{dataset.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dataset.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dataset.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dataset.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button size="small" onClick={() => navigate('/analysis')}>Analyze</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Box className="text-center py-8">
            <Typography variant="body1" className="text-gray-400 mb-4">
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
      <Grid container spacing={3} className="mb-4" style={{ padding: '25px' }}>
        <Grid item xs={12} md={8}>
          <Paper className="data-card p-6">
            <Typography variant="h6" className="font-bold mb-6">
              Activity Overview
            </Typography>
            <Box sx={{ height: 400, width: 600 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e1e1e', 
                      borderColor: '#2d2d2d',
                      color: '#fff',
                      padding: '10px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="data-card p-6 h-full">
            <Typography variant="h6" className="font-bold mb-6">
              Data Sources
            </Typography>
            <Box sx={{ height: 400, width: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e1e1e', 
                      borderColor: '#2d2d2d',
                      color: '#fff',
                      padding: '10px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

    </div>
  );
};

export default Dashboard;