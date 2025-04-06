import { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DataAnalysis = ({ data, setStatistics }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [correlations, setCorrelations] = useState([]);
  const [outliers, setOutliers] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const navigate = useNavigate();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate statistics when data changes
  useEffect(() => {
    if (!data || data.length === 0) {
      // If no data, redirect to upload page
      navigate('/upload');
      return;
    }

    // Calculate summary statistics
    const calculateSummary = () => {
      // Get all numeric columns
      const numericColumns = Object.keys(data[0]).filter(key => {
        return !isNaN(parseFloat(data[0][key])) && isFinite(data[0][key]);
      });

      // Calculate statistics for each numeric column
      const summaryStats = {};
      numericColumns.forEach(column => {
        const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
        
        // Sort values for percentiles
        const sortedValues = [...values].sort((a, b) => a - b);
        
        // Calculate statistics
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / values.length;
        
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        const q1Index = Math.floor(sortedValues.length * 0.25);
        const q2Index = Math.floor(sortedValues.length * 0.5);
        const q3Index = Math.floor(sortedValues.length * 0.75);
        
        const q1 = sortedValues[q1Index];
        const median = sortedValues[q2Index];
        const q3 = sortedValues[q3Index];
        
        const iqr = q3 - q1;
        
        summaryStats[column] = {
          count: values.length,
          mean: mean.toFixed(2),
          median: median.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2),
          stdDev: stdDev.toFixed(2),
          q1: q1.toFixed(2),
          q3: q3.toFixed(2),
          iqr: iqr.toFixed(2)
        };
      });

      return summaryStats;
    };

    // Calculate correlations between numeric columns
    const calculateCorrelations = () => {
      // Get all numeric columns
      const numericColumns = Object.keys(data[0]).filter(key => {
        return !isNaN(parseFloat(data[0][key])) && isFinite(data[0][key]);
      });

      // Calculate correlation for each pair of columns
      const correlationResults = [];
      
      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i];
          const col2 = numericColumns[j];
          
          const values1 = data.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
          const values2 = data.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));
          
          // Only calculate if we have the same number of values
          if (values1.length === values2.length && values1.length > 0) {
            // Calculate means
            const mean1 = values1.reduce((acc, val) => acc + val, 0) / values1.length;
            const mean2 = values2.reduce((acc, val) => acc + val, 0) / values2.length;
            
            // Calculate correlation coefficient
            let numerator = 0;
            let denom1 = 0;
            let denom2 = 0;
            
            for (let k = 0; k < values1.length; k++) {
              const diff1 = values1[k] - mean1;
              const diff2 = values2[k] - mean2;
              
              numerator += diff1 * diff2;
              denom1 += diff1 * diff1;
              denom2 += diff2 * diff2;
            }
            
            const correlation = numerator / (Math.sqrt(denom1) * Math.sqrt(denom2));
            
            // Determine correlation strength
            let strength = 'Weak';
            let color = 'default';
            
            const absCorr = Math.abs(correlation);
            if (absCorr > 0.7) {
              strength = 'Strong';
              color = correlation > 0 ? 'success' : 'error';
            } else if (absCorr > 0.3) {
              strength = 'Moderate';
              color = correlation > 0 ? 'info' : 'warning';
            }
            
            correlationResults.push({
              column1: col1,
              column2: col2,
              correlation: correlation.toFixed(2),
              strength,
              color
            });
          }
        }
      }
      
      return correlationResults;
    };

    // Calculate outliers
    const calculateOutliers = () => {
      // Get all numeric columns
      const numericColumns = Object.keys(data[0]).filter(key => {
        return !isNaN(parseFloat(data[0][key])) && isFinite(data[0][key]);
      });

      // Find outliers for each numeric column
      const outlierResults = [];
      
      numericColumns.forEach(column => {
        const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
        
        // Sort values
        const sortedValues = [...values].sort((a, b) => a - b);
        
        // Calculate quartiles
        const q1Index = Math.floor(sortedValues.length * 0.25);
        const q3Index = Math.floor(sortedValues.length * 0.75);
        
        const q1 = sortedValues[q1Index];
        const q3 = sortedValues[q3Index];
        
        // Calculate IQR and bounds
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        // Find outliers
        const outlierValues = values.filter(val => val < lowerBound || val > upperBound);
        
        if (outlierValues.length > 0) {
          outlierResults.push({
            column,
            count: outlierValues.length,
            percentage: ((outlierValues.length / values.length) * 100).toFixed(1),
            min: Math.min(...outlierValues).toFixed(2),
            max: Math.max(...outlierValues).toFixed(2)
          });
        }
      });
      
      return outlierResults;
    };

    // Calculate distributions
    const calculateDistributions = () => {
      // Get all columns
      const columns = Object.keys(data[0]);
      
      // Calculate distribution for each column
      const distributionResults = [];
      
      columns.forEach(column => {
        // For numeric columns, calculate range distribution
        if (!isNaN(parseFloat(data[0][column])) && isFinite(data[0][column])) {
          const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
          
          // Simple distribution into 5 buckets
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = max - min;
          const bucketSize = range / 5;
          
          const buckets = Array(5).fill(0);
          
          values.forEach(val => {
            const bucketIndex = Math.min(Math.floor((val - min) / bucketSize), 4);
            buckets[bucketIndex]++;
          });
          
          distributionResults.push({
            column,
            type: 'numeric',
            distribution: buckets.map((count, i) => ({
              range: `${(min + i * bucketSize).toFixed(1)} - ${(min + (i + 1) * bucketSize).toFixed(1)}`,
              count,
              percentage: ((count / values.length) * 100).toFixed(1)
            }))
          });
        } 
        // For categorical columns, calculate frequency distribution
        else {
          const valueMap = {};
          
          data.forEach(row => {
            const val = row[column];
            valueMap[val] = (valueMap[val] || 0) + 1;
          });
          
          // Sort by frequency
          const sortedValues = Object.entries(valueMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Top 10 values
            .map(([value, count]) => ({
              value,
              count,
              percentage: ((count / data.length) * 100).toFixed(1)
            }));
          
          distributionResults.push({
            column,
            type: 'categorical',
            distribution: sortedValues
          });
        }
      });
      
      return distributionResults;
    };

    // Calculate all statistics
    const summaryStats = calculateSummary();
    const correlationResults = calculateCorrelations();
    const outlierResults = calculateOutliers();
    const distributionResults = calculateDistributions();
    
    // Update state
    setSummary(summaryStats);
    setCorrelations(correlationResults);
    setOutliers(outlierResults);
    setDistributions(distributionResults);
    
    // Pass statistics to parent component
    setStatistics({
      summary: summaryStats,
      correlations: correlationResults,
      outliers: outlierResults,
      distributions: distributionResults
    });
  }, [data, navigate, setStatistics]);

  // If no data, show loading
  if (!data || !summary) {
    return (
      <Box className="p-4 text-center">
        <Typography variant="h5">Loading data analysis...</Typography>
      </Box>
    );
  }

  return (
    <div className="p-4">
      <Typography variant="h4" component="h1" gutterBottom className="font-bold">
        Data Analysis
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
        Comprehensive statistical analysis of your data
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analysis tabs">
          <Tab label="Summary Statistics" />
          <Tab label="Correlations" />
          <Tab label="Outliers" />
          <Tab label="Distributions" />
        </Tabs>
      </Box>
      
      {/* Summary Statistics Tab */}
      {activeTab === 0 && (
        <Paper className="data-card p-6">
          <Typography variant="h6" className="font-bold mb-4">
            Summary Statistics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Column</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Mean</TableCell>
                  <TableCell>Median</TableCell>
                  <TableCell>Min</TableCell>
                  <TableCell>Max</TableCell>
                  <TableCell>Std Dev</TableCell>
                  <TableCell>Q1</TableCell>
                  <TableCell>Q3</TableCell>
                  <TableCell>IQR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(summary).map(([column, stats]) => (
                  <TableRow key={column}>
                    <TableCell>{column}</TableCell>
                    <TableCell>{stats.count}</TableCell>
                    <TableCell>{stats.mean}</TableCell>
                    <TableCell>{stats.median}</TableCell>
                    <TableCell>{stats.min}</TableCell>
                    <TableCell>{stats.max}</TableCell>
                    <TableCell>{stats.stdDev}</TableCell>
                    <TableCell>{stats.q1}</TableCell>
                    <TableCell>{stats.q3}</TableCell>
                    <TableCell>{stats.iqr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Correlations Tab */}
      {activeTab === 1 && (
        <Paper className="data-card p-6">
          <Typography variant="h6" className="font-bold mb-4">
            Correlations Between Variables
          </Typography>
          {correlations.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Variable 1</TableCell>
                    <TableCell>Variable 2</TableCell>
                    <TableCell>Correlation</TableCell>
                    <TableCell>Strength</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {correlations.map((corr, index) => (
                    <TableRow key={index}>
                      <TableCell>{corr.column1}</TableCell>
                      <TableCell>{corr.column2}</TableCell>
                      <TableCell>{corr.correlation}</TableCell>
                      <TableCell>
                        <Chip 
                          label={corr.strength} 
                          color={corr.color} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" className="text-gray-400">
              No significant correlations found in the data.
            </Typography>
          )}
        </Paper>
      )}
      
      {/* Outliers Tab */}
      {activeTab === 2 && (
        <Paper className="data-card p-6">
          <Typography variant="h6" className="font-bold mb-4">
            Outliers Detection
          </Typography>
          {outliers.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Column</TableCell>
                    <TableCell>Outlier Count</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Min Value</TableCell>
                    <TableCell>Max Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outliers.map((outlier, index) => (
                    <TableRow key={index}>
                      <TableCell>{outlier.column}</TableCell>
                      <TableCell>{outlier.count}</TableCell>
                      <TableCell>{outlier.percentage}%</TableCell>
                      <TableCell>{outlier.min}</TableCell>
                      <TableCell>{outlier.max}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" className="text-gray-400">
              No significant outliers detected in the data.
            </Typography>
          )}
        </Paper>
      )}
      
      {/* Distributions Tab */}
      {activeTab === 3 && (
        <Paper className="data-card p-6">
          <Typography variant="h6" className="font-bold mb-4">
            Data Distributions
          </Typography>
          <Grid container spacing={3}>
            {distributions.map((dist, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper className="p-4">
                  <Typography variant="subtitle1" className="font-bold mb-2">
                    {dist.column} ({dist.type === 'numeric' ? 'Numeric' : 'Categorical'})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{dist.type === 'numeric' ? 'Range' : 'Value'}</TableCell>
                          <TableCell>Count</TableCell>
                          <TableCell>Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dist.distribution.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{dist.type === 'numeric' ? item.range : item.value}</TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>{item.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </div>
  );
};

export default DataAnalysis;