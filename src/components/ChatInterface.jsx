import { useState, useRef, useEffect } from 'react';
import { Typography, Paper, Box, TextField, IconButton, Avatar, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageWrapper from './PageWrapper';

const ChatInterface = ({ data, statistics }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: 'Hello! I\'m your AI assistant. Ask me anything about your data, and I\'ll provide insights and visualizations to help you understand it better.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          sender: 'ai',
          text: 'Try asking questions like "What\'s the average sales?" or "Show me the trend of revenue over time" or "What insights can you give me about customer age?"',
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [messages.length]);

  // If no data, show message to upload data
  if (!data || !statistics) {
    return (
      <PageWrapper>
        <Typography variant="h4" component="h1" gutterBottom className="font-bold">
          Chat Interface
        </Typography>
        <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
          Ask questions about your data using natural language
        </Typography>
        
        <Paper className="data-card p-6 text-center">
          <Typography variant="h6" className="mb-4">
            No data available for chat
          </Typography>
          <Typography variant="body1" className="text-gray-400 mb-4">
            Please upload data first to use the chat interface
          </Typography>
          <Box className="mt-4">
            <IconButton 
              color="primary" 
              size="large" 
              onClick={() => navigate('/upload')}
              className="bg-primary/10 hover:bg-primary/20"
            >
              <InsightsIcon fontSize="large" />
            </IconButton>
          </Box>
        </Paper>
      </PageWrapper>
    );
  }

  // Handle sending a message
  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      generateAIResponse(input);
      setIsProcessing(false);
    }, 1500);
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!isRecording) {
      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setIsRecording(true);
        
        // Simulate voice recording and processing
        setTimeout(() => {
          setIsRecording(false);
          setInput('Show me the distribution of sales by region');
        }, 3000);
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    } else {
      setIsRecording(false);
    }
  };

  // Generate AI response based on user input
  const generateAIResponse = (userInput) => {
    const query = userInput.toLowerCase();
    let response = '';
    let chartData = null;
    let chartType = null;

    // Get all column names for reference
    const columns = Object.keys(data[0] || {});
    const numericColumns = columns.filter(col => {
      return !isNaN(parseFloat(data[0][col])) && isFinite(data[0][col]);
    });

    // Check for different types of questions
    if (query.includes('average') || query.includes('mean')) {
      // Find which column they're asking about
      const targetColumn = numericColumns.find(col => query.includes(col.toLowerCase()));
      
      if (targetColumn && statistics.summary && statistics.summary[targetColumn]) {
        response = `The average ${targetColumn} is ${statistics.summary[targetColumn].mean}.`;
      } else {
        // If no specific column mentioned, provide averages for all numeric columns
        response = 'Here are the averages for your numeric data:\n';
        numericColumns.forEach(col => {
          if (statistics.summary && statistics.summary[col]) {
            response += `- Average ${col}: ${statistics.summary[col].mean}\n`;
          }
        });
      }
    } 
    else if (query.includes('maximum') || query.includes('max') || query.includes('highest')) {
      const targetColumn = numericColumns.find(col => query.includes(col.toLowerCase()));
      
      if (targetColumn && statistics.summary && statistics.summary[targetColumn]) {
        response = `The maximum ${targetColumn} is ${statistics.summary[targetColumn].max}.`;
      } else {
        response = 'Here are the maximum values for your numeric data:\n';
        numericColumns.forEach(col => {
          if (statistics.summary && statistics.summary[col]) {
            response += `- Maximum ${col}: ${statistics.summary[col].max}\n`;
          }
        });
      }
    }
    else if (query.includes('minimum') || query.includes('min') || query.includes('lowest')) {
      const targetColumn = numericColumns.find(col => query.includes(col.toLowerCase()));
      
      if (targetColumn && statistics.summary && statistics.summary[targetColumn]) {
        response = `The minimum ${targetColumn} is ${statistics.summary[targetColumn].min}.`;
      } else {
        response = 'Here are the minimum values for your numeric data:\n';
        numericColumns.forEach(col => {
          if (statistics.summary && statistics.summary[col]) {
            response += `- Minimum ${col}: ${statistics.summary[col].min}\n`;
          }
        });
      }
    }
    else if (query.includes('distribution') || query.includes('histogram')) {
      const targetColumn = columns.find(col => query.includes(col.toLowerCase()));
      
      if (targetColumn) {
        response = `Here's the distribution of ${targetColumn}:`;
        
        // Create chart data
        if (statistics.distributions) {
          const distribution = statistics.distributions.find(d => d.column === targetColumn);
          if (distribution) {
            chartData = distribution.distribution;
            chartType = distribution.type === 'numeric' ? 'bar' : 'bar';
          }
        }
      } else {
        response = 'Please specify which column you want to see the distribution for.';
      }
    }
    else if (query.includes('trend') || query.includes('over time')) {
      const targetColumn = numericColumns.find(col => query.includes(col.toLowerCase()));
      
      if (targetColumn) {
        response = `Here's the trend of ${targetColumn} over time:`;
        
        // Create mock time series data
        chartData = Array(6).fill().map((_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
          [targetColumn]: parseFloat(statistics.summary[targetColumn].mean) * (0.8 + Math.random() * 0.4)
        }));
        chartType = 'line';
      } else {
        response = 'Please specify which metric you want to see the trend for.';
      }
    }
    else if (query.includes('correlation') || query.includes('relationship')) {
      if (statistics.correlations && statistics.correlations.length > 0) {
        // Find strongest correlation
        const strongestCorrelation = statistics.correlations.reduce(
          (prev, current) => (Math.abs(parseFloat(current.correlation)) > Math.abs(parseFloat(prev.correlation)) ? current : prev),
          statistics.correlations[0]
        );
        
        response = `The strongest correlation is between ${strongestCorrelation.column1} and ${strongestCorrelation.column2} with a correlation coefficient of ${strongestCorrelation.correlation}. This is a ${strongestCorrelation.strength.toLowerCase()} ${parseFloat(strongestCorrelation.correlation) > 0 ? 'positive' : 'negative'} correlation.`;
      } else {
        response = 'I don\'t have correlation data for your dataset.';
      }
    }
    else if (query.includes('outlier') || query.includes('anomaly')) {
      if (statistics.outliers && statistics.outliers.length > 0) {
        response = 'I found the following outliers in your data:\n';
        statistics.outliers.forEach(outlier => {
          response += `- ${outlier.column}: ${outlier.count} outliers (${outlier.percentage}% of values)\n`;
        });
      } else {
        response = 'I didn\'t detect any significant outliers in your data.';
      }
    }
    else if (query.includes('insight') || query.includes('tell me about')) {
      const targetColumn = columns.find(col => query.includes(col.toLowerCase()));
      
      if (targetColumn) {
        if (!isNaN(parseFloat(data[0][targetColumn])) && isFinite(data[0][targetColumn])) {
          // Numeric column
          const stats = statistics.summary[targetColumn];
          response = `Here are some insights about ${targetColumn}:\n`;
          response += `- The average value is ${stats.mean}\n`;
          response += `- Values range from ${stats.min} to ${stats.max}\n`;
          response += `- The standard deviation is ${stats.stdDev}, indicating `;
          
          // Interpret standard deviation
          const range = parseFloat(stats.max) - parseFloat(stats.min);
          const stdDevRatio = parseFloat(stats.stdDev) / range;
          
          if (stdDevRatio > 0.3) {
            response += 'high variability in the data.\n';
          } else if (stdDevRatio > 0.1) {
            response += 'moderate variability in the data.\n';
          } else {
            response += 'low variability in the data.\n';
          }
          
          // Add outlier information if available
          const outlierInfo = statistics.outliers?.find(o => o.column === targetColumn);
          if (outlierInfo) {
            response += `- There are ${outlierInfo.count} outliers (${outlierInfo.percentage}% of values)\n`;
          }
          
          // Add correlation information if available
          const correlations = statistics.correlations?.filter(c => 
            c.column1 === targetColumn || c.column2 === targetColumn
          );
          
          if (correlations && correlations.length > 0) {
            const strongestCorr = correlations.reduce(
              (prev, current) => (Math.abs(parseFloat(current.correlation)) > Math.abs(parseFloat(prev.correlation)) ? current : prev),
              correlations[0]
            );
            
            const otherColumn = strongestCorr.column1 === targetColumn ? strongestCorr.column2 : strongestCorr.column1;
            response += `- ${targetColumn} has a ${strongestCorr.strength.toLowerCase()} correlation with ${otherColumn} (${strongestCorr.correlation})\n`;
          }
        } else {
          // Categorical column
          const distribution = statistics.distributions?.find(d => d.column === targetColumn);
          if (distribution) {
            response = `Here are some insights about ${targetColumn}:\n`;
            response += `- There are ${distribution.uniqueValues} unique values\n`;
            response += `- The most common value is "${distribution.mostCommon.value}" (${distribution.mostCommon.percentage}% of data)\n`;
            
            // Create chart data for distribution
            chartData = distribution.distribution;
            chartType = 'bar';
          } else {
            response = `I don't have detailed information about ${targetColumn}.`;
          }
        }
      } else {
        // General insights about the dataset
        response = 'Here are some general insights about your data:\n';
        response += `- Your dataset contains ${data.length} records with ${columns.length} columns\n`;
        response += `- There are ${numericColumns.length} numeric columns and ${columns.length - numericColumns.length} categorical columns\n`;
        
        // Add information about strongest correlation if available
        if (statistics.correlations && statistics.correlations.length > 0) {
          const strongestCorrelation = statistics.correlations.reduce(
            (prev, current) => (Math.abs(parseFloat(current.correlation)) > Math.abs(parseFloat(prev.correlation)) ? current : prev),
            statistics.correlations[0]
          );
          
          response += `- The strongest relationship is between ${strongestCorrelation.column1} and ${strongestCorrelation.column2}\n`;
        }
        
        // Add information about outliers if available
        if (statistics.outliers && statistics.outliers.length > 0) {
          const totalOutliers = statistics.outliers.reduce((sum, current) => sum + current.count, 0);
          response += `- I detected ${totalOutliers} outliers across ${statistics.outliers.length} columns\n`;
        }
      }
    }
    else {
      response = "I'm not sure how to answer that question. Try asking about averages, trends, distributions, or insights about specific columns in your data.";
    }

    // Add AI response with chart if applicable
    const aiMessage = {
      id: messages.length + 2,
      sender: 'ai',
      text: response,
      timestamp: new Date().toISOString(),
      chartData: chartData,
      chartType: chartType
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render chart based on type and data
  const renderChart = (chartType, chartData) => {
    if (!chartData || chartData.length === 0) return null;

    const chartHeight = 300;
    
    switch (chartType) {
      case 'bar':
        return (
          <Box sx={{ height: chartHeight, width: '100%', mt: 2 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
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
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      case 'line':
        return (
          <Box sx={{ height: chartHeight, width: '100%', mt: 2 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1e1e', 
                    borderColor: '#2d2d2d',
                    color: '#fff' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={Object.keys(chartData[0]).filter(key => key !== 'month')[0]} 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <Typography variant="h4" component="h1" gutterBottom className="font-bold">
        Chat Interface
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
        Ask questions about your data using natural language
      </Typography>
      
      <Paper className="data-card p-6 mb-8">
        <Box className="flex flex-20 h-[600px]">
          {/* Chat messages */}
          <Box className="flex-1 overflow-y-auto mb-4 p-2">
            {messages.map((message) => (
              <Box 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <Box 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary/10 text-white' 
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <Box className="flex items-center mb-2">
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem'
                        }}
                      >
                        AI
                      </Avatar>
                      <Typography variant="caption" className="ml-2 text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                  
                  {/* Render chart if available */}
                  {message.chartData && message.chartType && renderChart(message.chartType, message.chartData)}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Box className="mt-auto">
            {isProcessing && (
              <Box className="flex justify-center mb-2">
                <Chip 
                  icon={<CircularProgress size={16} />} 
                  label="Processing your request..." 
                  variant="outlined" 
                />
              </Box>
            )}
            <Box className="flex items-center">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a question about your data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                InputProps={{
                  endAdornment: (
                    <Box className="flex">
                      <IconButton 
                        color={isRecording ? 'error' : 'default'}
                        onClick={handleVoiceInput}
                        disabled={isProcessing}
                      >
                        {isRecording ? <MicOffIcon /> : <MicIcon />}
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        onClick={handleSendMessage}
                        disabled={isProcessing || input.trim() === ''}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  ),
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </PageWrapper>
  );
};

export default ChatInterface;