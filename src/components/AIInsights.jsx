import { useState, useEffect } from 'react';
import { Typography, Paper, Box, Grid, Card, CardContent, Divider, Chip, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import PageWrapper from './PageWrapper';

// Colors for charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

const AIInsights = ({ data, statistics }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [outliers, setOutliers] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate AI processing
    if (data && statistics) {
      setLoading(true);
      
      // Simulate delay for AI processing
      const timer = setTimeout(() => {
        generateInsights();
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [data, statistics]);

  // If no data or statistics, show message to upload data
  if (!data || !statistics) {
    return (
      <PageWrapper>
        <div className="p-4">
          <Typography variant="h4" component="h1" gutterBottom className="font-bold">
            AI Insights
          </Typography>
          <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
            Get AI-powered insights and predictions from your data
          </Typography>
          
          <Paper className="data-card p-6 text-center">
            <Typography variant="h6" className="mb-4">
              No data available for insights
            </Typography>
            <Typography variant="body1" className="text-gray-400 mb-4">
              Please upload data first to generate AI insights
            </Typography>
            <Box className="mt-4">
              <InsightsIcon color="primary" sx={{ fontSize: 48 }} />
            </Box>
          </Paper>
        </div>
      </PageWrapper>
    );
  }

  // Generate insights from data and statistics
  const generateInsights = () => {
    // Get all column names
    const columns = Object.keys(data[0] || {});
    const numericColumns = columns.filter(col => {
      return !isNaN(parseFloat(data[0][col])) && isFinite(data[0][col]);
    });

    // Generate key insights
    const generatedInsights = [];
    
    // Add insight about dataset size
    generatedInsights.push({
      title: 'Dataset Overview',
      description: `Your dataset contains ${data.length} records with ${columns.length} columns (${numericColumns.length} numeric, ${columns.length - numericColumns.length} categorical).`,
      type: 'info',
      icon: <InsightsIcon />
    });

    // Add insights about outliers if available
    if (statistics.outliers && statistics.outliers.length > 0) {
      const totalOutliers = statistics.outliers.reduce((sum, current) => sum + current.count, 0);
      const outlierPercentage = (totalOutliers / (data.length * numericColumns.length) * 100).toFixed(1);
      
      generatedInsights.push({
        title: 'Outlier Detection',
        description: `Found ${totalOutliers} outliers (${outlierPercentage}% of data points) across ${statistics.outliers.length} columns.`,
        type: 'warning',
        icon: <WarningIcon />
      });
    } else {
      generatedInsights.push({
        title: 'Data Quality',
        description: 'No significant outliers detected in your dataset.',
        type: 'success',
        icon: <CheckCircleIcon />
      });
    }

    // Add insights about correlations if available
    if (statistics.correlations && statistics.correlations.length > 0) {
      // Find strongest correlation
      const strongestCorrelation = statistics.correlations.reduce(
        (prev, current) => (Math.abs(parseFloat(current.correlation)) > Math.abs(parseFloat(prev.correlation)) ? current : prev),
        statistics.correlations[0]
      );
      
      generatedInsights.push({
        title: 'Key Relationship',
        description: `Strong ${parseFloat(strongestCorrelation.correlation) > 0 ? 'positive' : 'negative'} correlation (${strongestCorrelation.correlation}) between ${strongestCorrelation.column1} and ${strongestCorrelation.column2}.`,
        type: parseFloat(strongestCorrelation.correlation) > 0 ? 'positive' : 'negative',
        icon: parseFloat(strongestCorrelation.correlation) > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />
      });
    }

    // Add insight about distributions if available
    if (statistics.distributions && statistics.distributions.length > 0) {
      // Find distribution with highest skew
      const skewedDistribution = statistics.distributions.reduce(
        (prev, current) => (Math.abs(current.skew || 0) > Math.abs(prev.skew || 0) ? current : prev),
        statistics.distributions[0]
      );
      
      if (Math.abs(skewedDistribution.skew || 0) > 0.5) {
        generatedInsights.push({
          title: 'Distribution Pattern',
          description: `The ${skewedDistribution.column} distribution is ${skewedDistribution.skew > 0 ? 'right' : 'left'}-skewed (skew: ${skewedDistribution.skew?.toFixed(2)}), indicating asymmetry.`,
          type: 'info',
          icon: <HelpOutlineIcon />
        });
      }
    }

    // Set insights
    setInsights(generatedInsights);

    // Set correlations
    if (statistics.correlations) {
      // Sort by absolute correlation value
      const sortedCorrelations = [...statistics.correlations].sort(
        (a, b) => Math.abs(parseFloat(b.correlation)) - Math.abs(parseFloat(a.correlation))
      ).slice(0, 5); // Get top 5
      
      setCorrelations(sortedCorrelations);
    }

    // Set outliers
    if (statistics.outliers) {
      // Sort by percentage
      const sortedOutliers = [...statistics.outliers].sort(
        (a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)
      );
      
      setOutliers(sortedOutliers);
    }

    // Set distributions
    if (statistics.distributions) {
      setDistributions(statistics.distributions.slice(0, 4)); // Get first 4 distributions
    }
  };

  // Render correlation chart
  const renderCorrelationChart = () => {
    if (!correlations || correlations.length === 0) return null;

    const chartData = correlations.map(corr => ({
      name: `${corr.column1} / ${corr.column2}`,
      value: parseFloat(corr.correlation)
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis type="number" domain={[-1, 1]} stroke="#888" />
          <YAxis dataKey="name" type="category" width={150} stroke="#888" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000000',
              borderColor: '#000000',
              color: '#fff' 
            }} 
          />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#6366f1' : '#ec4899'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render distribution chart
  const renderDistributionChart = (distribution) => {
    if (!distribution || !distribution.distribution) return null;

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={distribution.distribution}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000000',
              borderColor: '#050505',
              color: '#fff' 
            }} 
          />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <PageWrapper>
      <div className="p-4">
        <Typography variant="h4" component="h1" gutterBottom className="font-bold">
          AI Insights
        </Typography>
        <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
          Get AI-powered insights and predictions from your data
        </Typography>
        
        {loading ? (
          <Paper className="data-card p-6 mb-8">
            <Box className="text-center">
              <Typography variant="h6" className="mb-4">
                Analyzing your data with AI...
              </Typography>
              <LinearProgress color="primary" className="mb-4" />
              <Typography variant="body2" className="text-gray-400">
                Our AI is examining patterns, correlations, and anomalies in your dataset
              </Typography>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Key Insights */}
            <Paper className="data-card p-6 mb-8">
              <Typography variant="h6" className="font-bold mb-4">
                Key Insights
              </Typography>
              <Grid container spacing={3}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card className="data-card h-full">
                      <CardContent>
                        <Box className="flex items-start">
                          <Box 
                            className="mr-3 p-2 rounded-full" 
                            sx={{ 
                              bgcolor: insight.type === 'warning' ? 'error.dark' : 
                                      insight.type === 'success' ? 'success.dark' : 
                                      insight.type === 'positive' ? 'success.dark' : 
                                      insight.type === 'negative' ? 'error.dark' : 
                                      'primary.dark' 
                            }}
                          >
                            {insight.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" className="font-bold mb-1">
                              {insight.title}
                            </Typography>
                            <Typography variant="body2" className="text-gray-400">
                              {insight.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Correlations */}
            {correlations.length > 0 && (
              <Paper className="data-card p-6 mb-8">
                <Typography variant="h6" className="font-bold mb-4">
                  Top Correlations
                </Typography>
                <Box className="mb-4">
                  {renderCorrelationChart()}
                </Box>
                <Typography variant="body2" className="text-gray-400 mt-2">
                  Values closer to 1 or -1 indicate stronger relationships between variables
                </Typography>
              </Paper>
            )}

            {/* Distributions */}
            {distributions.length > 0 && (
              <Paper className="data-card p-6 mb-8">
                <Typography variant="h6" className="font-bold mb-4">
                  Key Distributions
                </Typography>
                <Grid container spacing={3}>
                  {distributions.slice(0, 4).map((distribution, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card className="data-card h-full">
                        <CardContent>
                          <Typography variant="subtitle1" className="font-bold mb-2">
                            {distribution.column}
                          </Typography>
                          {renderDistributionChart(distribution)}
                          <Box className="mt-2">
                            <Chip 
                              size="small" 
                              label={`${distribution.uniqueValues} unique values`} 
                              className="mr-2 mb-2" 
                            />
                            {distribution.skew && (
                              <Chip 
                                size="small" 
                                label={`Skew: ${distribution.skew.toFixed(2)}`} 
                                className="mr-2 mb-2" 
                                color={Math.abs(distribution.skew) > 0.5 ? 'warning' : 'default'}
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Outliers */}
            {outliers.length > 0 && (
              <Paper className="data-card p-6 mb-8">
                <Typography variant="h6" className="font-bold mb-4">
                  Detected Outliers
                </Typography>
                <Grid container spacing={3}>
                  {outliers.map((outlier, index) => (
                    <Grid item xs={12} md={4} lg={3} key={index}>
                      <Card className="data-card h-full">
                        <CardContent>
                          <Typography variant="subtitle1" className="font-bold mb-2">
                            {outlier.column}
                          </Typography>
                          <Box className="flex items-center mb-2">
                            <WarningIcon color="error" className="mr-2" />
                            <Typography variant="h6">
                              {outlier.count} outliers
                            </Typography>
                          </Box>
                          <Typography variant="body2" className="text-gray-400">
                            {outlier.percentage}% of values
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default AIInsights;