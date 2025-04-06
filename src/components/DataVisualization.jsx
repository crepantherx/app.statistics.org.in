import { useState } from 'react';
import { Typography, Paper, Grid, Box, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, AreaChart, Area, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Colors for charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

const DataVisualization = ({ data, statistics }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedChart, setSelectedChart] = useState('bar');
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const navigate = useNavigate();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // If no data or statistics, redirect to upload
  if (!data || !statistics) {
    return (
      <Box className="p-4 text-center">
        <Typography variant="h5" className="mb-4">No data available for visualization</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/upload')}>
          Upload Data
        </Button>
      </Box>
    );
  }

  // Get all columns from data
  const columns = Object.keys(data[0] || {});
  
  // Get numeric columns for charts
  const numericColumns = columns.filter(col => {
    return !isNaN(parseFloat(data[0][col])) && isFinite(data[0][col]);
  });

  // Get categorical columns
  const categoricalColumns = columns.filter(col => {
    return isNaN(parseFloat(data[0][col])) || !isFinite(data[0][col]);
  });

  // Initialize selected columns if not set
  if (numericColumns.length > 0 && !selectedColumn) {
    setSelectedColumn(numericColumns[0]);
  }
  
  if (numericColumns.length > 0 && categoricalColumns.length > 0 && !selectedXAxis) {
    setSelectedXAxis(categoricalColumns[0]);
    setSelectedYAxis(numericColumns[0]);
  }

  // Prepare data for distribution chart
  const prepareDistributionData = () => {
    if (!selectedColumn || !statistics.distributions) return [];
    
    const distribution = statistics.distributions.find(d => d.column === selectedColumn);
    if (!distribution) return [];
    
    return distribution.distribution;
  };

  // Prepare data for correlation chart
  const prepareCorrelationData = () => {
    if (!selectedXAxis || !selectedYAxis) return [];
    
    return data.map(item => ({
      x: item[selectedXAxis],
      y: parseFloat(item[selectedYAxis])
    }));
  };

  // Prepare data for time series (assuming one column might be a date)
  const prepareTimeSeriesData = () => {
    if (!selectedYAxis) return [];
    
    // For demo, we'll just use the first 20 data points
    return data.slice(0, 20).map((item, index) => ({
      name: index + 1, // Using index as x-axis for demo
      value: parseFloat(item[selectedYAxis])
    }));
  };

  // Prepare data for comparison chart
  const prepareComparisonData = () => {
    if (numericColumns.length < 2) return [];
    
    // For demo, we'll use the first 10 data points and compare all numeric columns
    return data.slice(0, 10).map((item, index) => {
      const result = { name: index + 1 };
      numericColumns.forEach(col => {
        result[col] = parseFloat(item[col]);
      });
      return result;
    });
  };

  return (
    <div className="p-4">
      <Typography variant="h4" component="h1" gutterBottom className="font-bold">
        Data Visualization
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
        Visualize your data with interactive charts
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="visualization tabs">
          <Tab label="Distribution" />
          <Tab label="Correlation" />
          <Tab label="Time Series" />
          <Tab label="Comparison" />
        </Tabs>
      </Box>
      
      {/* Distribution Tab */}
      {activeTab === 0 && (
        <>
          <Paper className="data-card p-6 mb-6">
            <Grid container spacing={3} className="mb-4">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Column</InputLabel>
                  <Select
                    value={selectedColumn}
                    label="Select Column"
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    {columns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={selectedChart}
                    label="Chart Type"
                    onChange={(e) => setSelectedChart(e.target.value)}
                  >
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === 'bar' ? (
                  <BarChart data={prepareDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                    <XAxis 
                      dataKey={statistics.distributions?.find(d => d.column === selectedColumn)?.type === 'numeric' ? 'range' : 'value'} 
                      stroke="#888" 
                    />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e1e', 
                        borderColor: '#2d2d2d',
                        color: '#fff' 
                      }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="#6366f1" 
                      name="Count" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={prepareDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey={statistics.distributions?.find(d => d.column === selectedColumn)?.type === 'numeric' ? 'range' : 'value'}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e1e', 
                        borderColor: '#2d2d2d',
                        color: '#fff' 
                      }} 
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          <Paper className="data-card p-6">
            <Typography variant="h6" className="font-bold mb-4">
              Distribution Insights
            </Typography>
            <Typography variant="body1">
              {selectedColumn && statistics.distributions?.find(d => d.column === selectedColumn)?.type === 'numeric' ? (
                <>
                  The distribution of <strong>{selectedColumn}</strong> shows the frequency of values across different ranges. 
                  This can help identify patterns, skewness, and potential outliers in your data.
                </>
              ) : (
                <>
                  The distribution of <strong>{selectedColumn}</strong> shows the frequency of each category. 
                  This visualization helps understand the balance between different categories in your data.
                </>
              )}
            </Typography>
          </Paper>
        </>
      )}
      
      {/* Correlation Tab */}
      {activeTab === 1 && (
        <>
          <Paper className="data-card p-6 mb-6">
            <Grid container spacing={3} className="mb-4">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>X-Axis (Category)</InputLabel>
                  <Select
                    value={selectedXAxis}
                    label="X-Axis (Category)"
                    onChange={(e) => setSelectedXAxis(e.target.value)}
                  >
                    {categoricalColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Y-Axis (Numeric)</InputLabel>
                  <Select
                    value={selectedYAxis}
                    label="Y-Axis (Numeric)"
                    onChange={(e) => setSelectedYAxis(e.target.value)}
                  >
                    {numericColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                  <XAxis 
                    dataKey="x" 
                    name={selectedXAxis} 
                    stroke="#888" 
                    type="category" 
                  />
                  <YAxis 
                    dataKey="y" 
                    name={selectedYAxis} 
                    stroke="#888" 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ 
                      backgroundColor: '#1e1e1e', 
                      borderColor: '#2d2d2d',
                      color: '#fff' 
                    }} 
                  />
                  <Scatter 
                    name={`${selectedXAxis} vs ${selectedYAxis}`} 
                    data={prepareCorrelationData()} 
                    fill="#6366f1" 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          <Paper className="data-card p-6">
            <Typography variant="h6" className="font-bold mb-4">
              Correlation Insights
            </Typography>
            <Typography variant="body1">
              This scatter plot shows the relationship between <strong>{selectedXAxis}</strong> and <strong>{selectedYAxis}</strong>. 
              {statistics.correlations?.some(c => 
                (c.column1 === selectedXAxis && c.column2 === selectedYAxis) || 
                (c.column1 === selectedYAxis && c.column2 === selectedXAxis)
              ) ? (
                <> 
                  The correlation is {statistics.correlations.find(c => 
                    (c.column1 === selectedXAxis && c.column2 === selectedYAxis) || 
                    (c.column1 === selectedYAxis && c.column2 === selectedXAxis)
                  )?.strength.toLowerCase()}, indicating a {statistics.correlations.find(c => 
                    (c.column1 === selectedXAxis && c.column2 === selectedYAxis) || 
                    (c.column1 === selectedYAxis && c.column2 === selectedXAxis)
                  )?.correlation > 0 ? 'positive' : 'negative'} relationship.
                </>
              ) : (
                <> Patterns in this plot can reveal relationships between these variables.</>  
              )}
            </Typography>
          </Paper>
        </>
      )}
      
      {/* Time Series Tab */}
      {activeTab === 2 && (
        <>
          <Paper className="data-card p-6 mb-6">
            <Grid container spacing={3} className="mb-4">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Metric</InputLabel>
                  <Select
                    value={selectedYAxis}
                    label="Select Metric"
                    onChange={(e) => setSelectedYAxis(e.target.value)}
                  >
                    {numericColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={selectedChart}
                    label="Chart Type"
                    onChange={(e) => setSelectedChart(e.target.value)}
                  >
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="area">Area Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === 'line' ? (
                  <LineChart data={prepareTimeSeriesData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e1e', 
                        borderColor: '#2d2d2d',
                        color: '#fff' 
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name={selectedYAxis} 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={prepareTimeSeriesData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e1e', 
                        borderColor: '#2d2d2d',
                        color: '#fff' 
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name={selectedYAxis} 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          <Paper className="data-card p-6">
            <Typography variant="h6" className="font-bold mb-4">
              Time Series Insights
            </Typography>
            <Typography variant="body1">
              This time series visualization shows how <strong>{selectedYAxis}</strong> changes over time. 
              Look for trends, seasonality, and anomalies in the data pattern.
              {selectedYAxis && statistics.summary?.[selectedYAxis] && (
                <> The average value is {statistics.summary[selectedYAxis].mean} with a standard deviation of {statistics.summary[selectedYAxis].stdDev}.</>
              )}
            </Typography>
          </Paper>
        </>
      )}
      
      {/* Comparison Tab */}
      {activeTab === 3 && (
        <>
          <Paper className="data-card p-6 mb-6">
            <Typography variant="h6" className="font-bold mb-4">
              Compare Multiple Metrics
            </Typography>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e1e1e', 
                      borderColor: '#2d2d2d',
                      color: '#fff' 
                    }} 
                  />
                  <Legend />
                  {numericColumns.map((column, index) => (
                    <Bar 
                      key={column} 
                      dataKey={column} 
                      fill={COLORS[index % COLORS.length]} 
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          
          <Paper className="data-card p-6">
            <Typography variant="h6" className="font-bold mb-4">
              Comparison Insights
            </Typography>
            <Typography variant="body1">
              This chart compares multiple numeric metrics side by side. It helps identify relationships and patterns across different variables in your dataset.
              {numericColumns.length > 0 && (
                <> The chart includes {numericColumns.length} metrics: {numericColumns.join(', ')}.</>
              )}
            </Typography>
          </Paper>
        </>
      )}
    </div>
  );
};

export default DataVisualization;