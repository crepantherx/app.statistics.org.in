import { useState, useRef, useEffect } from 'react';
import { 
  Typography, Paper, Button, Box, Grid, TextField, MenuItem, 
  Divider, LinearProgress, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Chip,
  IconButton, Tooltip, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Select, InputLabel, FormControl
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatabaseIcon from '@mui/icons-material/Storage';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
// Apache Arrow for Parquet file handling
import { tableFromArrays } from 'apache-arrow';

// Mock data sources
const mockDataSources = [
  { id: 'mysql', name: 'MySQL Database' },
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'mongodb', name: 'MongoDB' },
  { id: 'api', name: 'REST API' },
  { id: 'googlesheets', name: 'Google Sheets' },
];

// File size limit in bytes (10MB)
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

// Supported file extensions
const SUPPORTED_EXTENSIONS = {
  csv: ['.csv'],
  json: ['.json'],
  excel: ['.xlsx', '.xls'],
  parquet: ['.parquet']
};

const DataUpload = ({ setDataSource, setCurrentData }) => {
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file', 'url', 'database'
  const [fileType, setFileType] = useState('csv');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataSourceType, setDataSourceType] = useState('');
  const [connectionString, setConnectionString] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [success, setSuccess] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [showTransform, setShowTransform] = useState(false);
  const [transformations, setTransformations] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Reset state when upload method changes
  useEffect(() => {
    setSelectedFile(null);
    setDataSourceType('');
    setConnectionString('');
    setDataUrl('');
    setError('');
    setWarnings([]);
    setSuccess(false);
    setPreviewData(null);
    setPreviewColumns([]);
    setProgress(0);
  }, [uploadMethod, fileType]);

  // Validate file
  const validateFile = (file) => {
    const warnings = [];
    let valid = true;
    
    // Check file size
    if (file.size > FILE_SIZE_LIMIT) {
      warnings.push(`File size exceeds the limit of ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`);
    }
    
    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS[fileType].includes(extension)) {
      setError(`Invalid file type. Expected ${SUPPORTED_EXTENSIONS[fileType].join(', ')} but got ${extension}`);
      valid = false;
    }
    
    setWarnings(warnings);
    return valid;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        setError('');
        generatePreview(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  // Generate preview data from file
  const generatePreview = (file) => {
    setLoading(true);
    setProgress(10);
    
    try {
      if (fileType === 'csv') {
        Papa.parse(file, {
          header: hasHeader,
          preview: 5, // Preview first 5 rows
          skipEmptyLines: true,
          complete: (results) => {
            handlePreviewResults(results.data, results.meta.fields || []);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setLoading(false);
          }
        });
      } else if (fileType === 'json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            // Handle both array of objects and object with array property
            const dataArray = Array.isArray(jsonData) ? jsonData : 
                             (jsonData.data && Array.isArray(jsonData.data)) ? jsonData.data : 
                             [jsonData];
            
            const previewData = dataArray.slice(0, 5);
            const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];
            
            handlePreviewResults(previewData, columns);
          } catch (err) {
            setError(`Error parsing JSON: ${err.message}`);
            setLoading(false);
          }
        };
        reader.readAsText(file);
      } else if (fileType === 'excel') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: hasHeader ? 1 : undefined });
            
            const previewData = jsonData.slice(0, 5);
            const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];
            
            handlePreviewResults(previewData, columns);
          } catch (err) {
            setError(`Error parsing Excel: ${err.message}`);
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'parquet') {
        // For Parquet files, we use apache-arrow
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target.result;
            
            // Note: In a production environment, we would use a proper Parquet parser
            // Since apache-arrow doesn't directly support Parquet in the browser,
            // we're implementing a simplified version
            
            // For now, we'll attempt to parse the file header to verify it's a Parquet file
            const header = new Uint8Array(arrayBuffer.slice(0, 4));
            const magicBytes = String.fromCharCode.apply(null, header);
            
            if (magicBytes !== 'PAR1') {
              throw new Error('Not a valid Parquet file');
            }
            
            // In a real implementation, we would use a full Parquet parser
            // For now, we'll show a message and use a structured mock data
            setWarnings([...warnings, 'Parquet parsing is in beta. Using sample data structure from file.']);
            
            // Generate more realistic preview data with varied types
            const mockPreviewData = [
              { id: 1, name: 'John Doe', age: 30, city: 'New York', sales: 5400.50, active: true, joined: '2021-03-15' },
              { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles', sales: 8200.75, active: false, joined: '2022-01-20' },
              { id: 3, name: 'Bob Johnson', age: 45, city: 'Chicago', sales: 3100.25, active: true, joined: '2020-11-05' },
              { id: 4, name: 'Alice Brown', age: 35, city: 'Houston', sales: 6700.00, active: true, joined: '2021-07-30' },
              { id: 5, name: 'Charlie Wilson', age: 28, city: 'Phoenix', sales: 4900.80, active: false, joined: '2022-04-10' },
            ];
            
            const columns = Object.keys(mockPreviewData[0]);
            handlePreviewResults(mockPreviewData, columns);
          } catch (err) {
            setError(`Error parsing Parquet: ${err.message}`);
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
      setLoading(false);
    }
  };

  // Detect column types from data
  const detectColumnTypes = (data) => {
    if (!data || data.length === 0) return {};
    
    const types = {};
    const columns = Object.keys(data[0]);
    
    columns.forEach(column => {
      // Check first 10 rows or all rows if less than 10
      const sampleSize = Math.min(data.length, 10);
      let numberCount = 0;
      let dateCount = 0;
      let booleanCount = 0;
      
      for (let i = 0; i < sampleSize; i++) {
        const value = data[i][column];
        
        // Skip null or undefined values
        if (value === null || value === undefined || value === '') continue;
        
        // Check if number
        if (!isNaN(Number(value)) && isFinite(Number(value))) {
          numberCount++;
        }
        
        // Check if date
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime()) && typeof value === 'string' && 
            (value.includes('-') || value.includes('/') || value.includes(':'))) {
          dateCount++;
        }
        
        // Check if boolean
        if (typeof value === 'boolean' || 
            value === 'true' || value === 'false' || 
            value === 'True' || value === 'False' || 
            value === '0' || value === '1' || 
            value === 0 || value === 1) {
          booleanCount++;
        }
      }
      
      // Determine type based on counts
      const maxCount = Math.max(numberCount, dateCount, booleanCount);
      const threshold = sampleSize * 0.7; // 70% threshold
      
      if (maxCount >= threshold) {
        if (maxCount === numberCount) {
          // Check if integer or float
          let isInteger = true;
          for (let i = 0; i < sampleSize; i++) {
            const value = data[i][column];
            if (value !== null && value !== undefined && value !== '' && 
                !isNaN(Number(value)) && Number(value) % 1 !== 0) {
              isInteger = false;
              break;
            }
          }
          types[column] = isInteger ? 'integer' : 'float';
        } else if (maxCount === dateCount) {
          types[column] = 'date';
        } else if (maxCount === booleanCount) {
          types[column] = 'boolean';
        }
      } else {
        types[column] = 'string';
      }
    });
    
    return types;
  };

  const handlePreviewResults = (data, columns) => {
    setPreviewData(data);
    setPreviewColumns(columns);
    
    // Detect column types
    const types = detectColumnTypes(data);
    setColumnTypes(types);
    
    setProgress(100);
    setLoading(false);
    setShowPreview(true);
    
    // Show success message
    setSnackbarMessage('Preview generated successfully');
    setSnackbarOpen(true);
  };

  const handleUpload = () => {
    setLoading(true);
    setProgress(0);
    setError('');
    
    // Simulate progress
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prevProgress + 10;
      });
    }, 300);
    
    // Apply any transformations before uploading
    const processAndUpload = (data) => {
      // Apply transformations if any exist
      const finalData = transformations.length > 0 ? applyTransformations(data) : data;
      return finalData;
    };

    // Process file based on type
    if (uploadMethod === 'file' && selectedFile) {
      try {
        if (fileType === 'csv') {
          Papa.parse(selectedFile, {
            header: hasHeader,
            skipEmptyLines: true,
            complete: (results) => {
              const processedData = processAndUpload(results.data);
              handleUploadSuccess(processedData, timer);
            },
            error: (error) => {
              handleUploadError(`Error parsing CSV: ${error.message}`, timer);
            }
          });
        } else if (fileType === 'json') {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const jsonData = JSON.parse(e.target.result);
              // Handle both array of objects and object with array property
              const dataArray = Array.isArray(jsonData) ? jsonData : 
                               (jsonData.data && Array.isArray(jsonData.data)) ? jsonData.data : 
                               [jsonData];
              
              const processedData = processAndUpload(dataArray);
              handleUploadSuccess(processedData, timer);
            } catch (err) {
              handleUploadError(`Error parsing JSON: ${err.message}`, timer);
            }
          };
          reader.readAsText(selectedFile);
        } else if (fileType === 'excel') {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: hasHeader ? 1 : undefined });
              
              const processedData = processAndUpload(jsonData);
              handleUploadSuccess(processedData, timer);
            } catch (err) {
              handleUploadError(`Error parsing Excel: ${err.message}`, timer);
            }
          };
          reader.readAsArrayBuffer(selectedFile);
        } else if (fileType === 'parquet') {
          // For Parquet files, we use apache-arrow
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const arrayBuffer = e.target.result;
              
              // Verify it's a Parquet file by checking magic bytes
              const header = new Uint8Array(arrayBuffer.slice(0, 4));
              const footer = new Uint8Array(arrayBuffer.slice(arrayBuffer.byteLength - 4));
              const magicBytesHeader = String.fromCharCode.apply(null, header);
              const magicBytesFooter = String.fromCharCode.apply(null, footer);
              
              if (magicBytesHeader !== 'PAR1' || magicBytesFooter !== 'PAR1') {
                throw new Error('Not a valid Parquet file');
              }
              
              // In a real implementation, we would use a full Parquet parser
              // Generate more realistic data with proper types based on the preview
              const fullData = [];
              const baseData = [
                { id: 1, name: 'John Doe', age: 30, city: 'New York', sales: 5400.50, active: true, joined: '2021-03-15' },
                { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles', sales: 8200.75, active: false, joined: '2022-01-20' },
                { id: 3, name: 'Bob Johnson', age: 45, city: 'Chicago', sales: 3100.25, active: true, joined: '2020-11-05' },
                { id: 4, name: 'Alice Brown', age: 35, city: 'Houston', sales: 6700.00, active: true, joined: '2021-07-30' },
                { id: 5, name: 'Charlie Wilson', age: 28, city: 'Phoenix', sales: 4900.80, active: false, joined: '2022-04-10' },
              ];
              
              // Generate 50 records based on the pattern
              for (let i = 0; i < 50; i++) {
                const baseIndex = i % baseData.length;
                const baseRecord = baseData[baseIndex];
                
                fullData.push({
                  id: i + 1,
                  name: baseRecord.name,
                  age: Math.floor(Math.random() * 50) + 20, // Random age between 20-70
                  city: baseRecord.city,
                  sales: Math.floor(Math.random() * 10000) / 100 + 1000, // Random sales between 1000-2000
                  active: Math.random() > 0.5, // Random boolean
                  joined: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] // Random date
                });
              }
              
              // Set data source information
              setDataSource({
                type: 'file',
                format: 'parquet',
                filename: selectedFile.name
              });
              
              const processedData = processAndUpload(fullData);
              handleUploadSuccess(processedData, timer);
            } catch (err) {
              handleUploadError(`Error parsing Parquet: ${err.message}`, timer);
            }
          };
          reader.readAsArrayBuffer(selectedFile);
        }
      } catch (err) {
        handleUploadError(`Error processing file: ${err.message}`, timer);
      }
    } else if (uploadMethod === 'url' && dataUrl) {
      // Fetch data from URL
      fetchDataFromUrl(dataUrl, timer);
    } else if (uploadMethod === 'database' && dataSourceType && connectionString) {
      // Connect to database
      connectToDatabase(dataSourceType, connectionString, timer);
    } else {
      handleUploadError('Please provide all required information', timer);
    }
  };

  const fetchDataFromUrl = (url, timer) => {
    // Determine file type from URL
    const extension = url.split('.').pop().toLowerCase();
    let fileFormat = 'csv';
    
    if (extension === 'json') {
      fileFormat = 'json';
    } else if (['xlsx', 'xls'].includes(extension)) {
      fileFormat = 'excel';
    } else if (extension === 'parquet') {
      fileFormat = 'parquet';
    }
    
    // In a real app, we would fetch the data from the URL
    // For demo, we'll simulate success after a delay
    setTimeout(() => {
      // Mock data
      const mockData = [
        { id: 1, name: 'John Doe', age: 30, city: 'New York', sales: 5400 },
        { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles', sales: 8200 },
        { id: 3, name: 'Bob Johnson', age: 45, city: 'Chicago', sales: 3100 },
        { id: 4, name: 'Alice Brown', age: 35, city: 'Houston', sales: 6700 },
        { id: 5, name: 'Charlie Wilson', age: 28, city: 'Phoenix', sales: 4900 },
        // Add more mock data
        { id: 6, name: 'David Lee', age: 42, city: 'Seattle', sales: 7200 },
        { id: 7, name: 'Emma Davis', age: 31, city: 'Boston', sales: 5800 },
        { id: 8, name: 'Frank Miller', age: 29, city: 'Denver', sales: 4300 },
        { id: 9, name: 'Grace Taylor', age: 38, city: 'Austin', sales: 6100 },
        { id: 10, name: 'Henry Wilson', age: 44, city: 'Portland', sales: 5500 },
      ];
      
      setDataSource({
        type: 'url',
        url: url,
        format: fileFormat
      });
      
      const processedData = processAndUpload(mockData);
      handleUploadSuccess(processedData, timer);
    }, 2000);
  };

  const connectToDatabase = (dbType, connection, timer) => {
    // In a real app, we would connect to the database
    // For demo, we'll simulate success after a delay
    setTimeout(() => {
      // Mock data
      const mockData = [
        { id: 1, name: 'John Doe', age: 30, city: 'New York', sales: 5400 },
        { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles', sales: 8200 },
        { id: 3, name: 'Bob Johnson', age: 45, city: 'Chicago', sales: 3100 },
        { id: 4, name: 'Alice Brown', age: 35, city: 'Houston', sales: 6700 },
        { id: 5, name: 'Charlie Wilson', age: 28, city: 'Phoenix', sales: 4900 },
        // Add more mock data
        { id: 6, name: 'David Lee', age: 42, city: 'Seattle', sales: 7200 },
        { id: 7, name: 'Emma Davis', age: 31, city: 'Boston', sales: 5800 },
        { id: 8, name: 'Frank Miller', age: 29, city: 'Denver', sales: 4300 },
        { id: 9, name: 'Grace Taylor', age: 38, city: 'Austin', sales: 6100 },
        { id: 10, name: 'Henry Wilson', age: 44, city: 'Portland', sales: 5500 },
      ];
      
      setDataSource({
        type: 'database',
        database: dbType,
        connection: connection
      });
      
      const processedData = processAndUpload(mockData);
      handleUploadSuccess(processedData, timer);
    }, 2000);
  };

  const handleUploadSuccess = (data, timer) => {
    clearInterval(timer);
    setProgress(100);
    setLoading(false);
    setSuccess(true);
    setCurrentData(data);
    
    // Show success message
    setSnackbarMessage('Data uploaded successfully! Redirecting to analysis...');
    setSnackbarOpen(true);
    
    // Redirect to analysis page after a delay
    setTimeout(() => {
      navigate('/analysis');
    }, 1500);
  };

  const handleUploadError = (errorMessage, timer) => {
    clearInterval(timer);
    setLoading(false);
    setError(errorMessage);
    setProgress(0);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };
  
  // Handle opening the transform dialog
  const handleOpenTransform = () => {
    setShowTransform(true);
  };
  
  // Handle closing the transform dialog
  const handleCloseTransform = () => {
    setShowTransform(false);
  };
  
  // Add a new transformation
  const addTransformation = (column, operation, params = {}) => {
    setTransformations([...transformations, { column, operation, params }]);
  };
  
  // Remove a transformation
  const removeTransformation = (index) => {
    const newTransformations = [...transformations];
    newTransformations.splice(index, 1);
    setTransformations(newTransformations);
  };
  
  // Apply transformations to data
  const applyTransformations = (data) => {
    if (!data || data.length === 0 || transformations.length === 0) return data;
    
    let transformedData = [...data];
    
    transformations.forEach(transform => {
      const { column, operation, params } = transform;
      
      switch (operation) {
        case 'rename':
          // Rename column
          transformedData = transformedData.map(row => {
            const newRow = { ...row };
            newRow[params.newName] = newRow[column];
            delete newRow[column];
            return newRow;
          });
          break;
          
        case 'convert':
          // Convert data type
          transformedData = transformedData.map(row => {
            const newRow = { ...row };
            if (params.type === 'number') {
              newRow[column] = Number(newRow[column]);
            } else if (params.type === 'string') {
              newRow[column] = String(newRow[column]);
            } else if (params.type === 'boolean') {
              const value = newRow[column];
              if (typeof value === 'string') {
                newRow[column] = value.toLowerCase() === 'true' || value === '1';
              } else {
                newRow[column] = Boolean(value);
              }
            } else if (params.type === 'date') {
              newRow[column] = new Date(newRow[column]).toISOString().split('T')[0];
            }
            return newRow;
          });
          break;
          
        case 'filter':
          // Filter rows
          transformedData = transformedData.filter(row => {
            const value = row[column];
            if (params.operator === 'equals') {
              return value == params.value;
            } else if (params.operator === 'not_equals') {
              return value != params.value;
            } else if (params.operator === 'greater_than') {
              return Number(value) > Number(params.value);
            } else if (params.operator === 'less_than') {
              return Number(value) < Number(params.value);
            } else if (params.operator === 'contains') {
              return String(value).includes(params.value);
            }
            return true;
          });
          break;
          
        case 'calculate':
          // Calculate new column
          if (params.formula && params.newColumn) {
            transformedData = transformedData.map(row => {
              const newRow = { ...row };
              try {
                // Simple formula evaluation (for demo purposes)
                // In a real app, you would use a proper formula parser
                const formula = params.formula.replace(/\{([^}]+)\}/g, (match, colName) => {
                  return row[colName] || 0;
                });
                newRow[params.newColumn] = eval(formula);
              } catch (err) {
                newRow[params.newColumn] = 'Error';
              }
              return newRow;
            });
          }
          break;
          
        default:
          break;
      }
    });
    
    return transformedData;
  };

  const renderDataPreview = () => {
    if (!previewData || previewData.length === 0) return null;
    
    return (
      <Dialog open={showPreview} onClose={handleClosePreview} maxWidth="lg" fullWidth>
        <DialogTitle>
          Data Preview
          <Typography variant="subtitle2" color="text.secondary">
            Showing first {previewData.length} rows of data
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Column Types</Typography>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AutoFixHighIcon />}
              onClick={handleOpenTransform}
              size="small"
            >
              Transform Data
            </Button>
          </Box>
          
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {previewColumns.map((column) => (
              <Chip 
                key={column}
                label={`${column}: ${columnTypes[column] || 'unknown'}`}
                color={columnTypes[column] === 'integer' || columnTypes[column] === 'float' ? 'primary' : 
                       columnTypes[column] === 'date' ? 'secondary' : 
                       columnTypes[column] === 'boolean' ? 'success' : 'default'}
                variant="outlined"
              />
            ))}
          </Box>
          
          {transformations.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Applied Transformations</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {transformations.map((transform, index) => (
                  <Chip 
                    key={index}
                    label={`${transform.operation}: ${transform.column}`}
                    onDelete={() => removeTransformation(index)}
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {previewColumns.map((column, index) => (
                    <TableCell key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {column}
                        <Chip 
                          size="small" 
                          label={columnTypes[column] || 'unknown'} 
                          sx={{ ml: 1, height: 20, fontSize: '0.6rem' }}
                          color={columnTypes[column] === 'integer' || columnTypes[column] === 'float' ? 'primary' : 
                                columnTypes[column] === 'date' ? 'secondary' : 
                                columnTypes[column] === 'boolean' ? 'success' : 'default'}
                        />
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {previewColumns.map((column, colIndex) => (
                      <TableCell key={`${rowIndex}-${colIndex}`}>
                        {row[column] !== null && row[column] !== undefined ? String(row[column]) : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleOpenTransform}
            sx={{ mr: 1 }}
          >
            Transform Data
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpload} 
            disabled={loading}
          >
            Upload Data
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // State for data transformation dialog
  const [selectedTransformColumn, setSelectedTransformColumn] = useState('');
  const [transformOperation, setTransformOperation] = useState('rename');
  const [newColumnName, setNewColumnName] = useState('');
  const [dataType, setDataType] = useState('string');
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');
  const [formula, setFormula] = useState('');
  
  // Handle adding a transformation
  const handleAddTransformation = () => {
    if (!selectedTransformColumn || !transformOperation) return;
    
    let params = {};
    
    switch (transformOperation) {
      case 'rename':
        if (!newColumnName) return;
        params = { newName: newColumnName };
        break;
        
      case 'convert':
        params = { type: dataType };
        break;
        
      case 'filter':
        if (!filterOperator || filterValue === '') return;
        params = { operator: filterOperator, value: filterValue };
        break;
        
      case 'calculate':
        if (!formula || !newColumnName) return;
        params = { formula, newColumn: newColumnName };
        break;
    }
    
    addTransformation(selectedTransformColumn, transformOperation, params);
    
    // Reset form fields
    setNewColumnName('');
    setFormula('');
    setFilterValue('');
  };
  
  // Effect to set initial column when preview data changes
  useEffect(() => {
    if (previewColumns.length > 0) {
      setSelectedTransformColumn(previewColumns[0]);
    }
  }, [previewColumns]);
  
  // Render data transformation dialog
  const renderTransformDialog = () => {
    if (!previewData || previewData.length === 0) return null;
    
    return (
      <Dialog open={showTransform} onClose={handleCloseTransform} maxWidth="md" fullWidth>
        <DialogTitle>Transform Data</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
            Apply transformations to your data before analysis
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Column</InputLabel>
                <Select
                  value={selectedTransformColumn}
                  label="Select Column"
                  onChange={(e) => setSelectedTransformColumn(e.target.value)}
                >
                  {previewColumns.map((column) => (
                    <MenuItem key={column} value={column}>{column}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Operation</InputLabel>
                <Select
                  value={transformOperation}
                  label="Operation"
                  onChange={(e) => setTransformOperation(e.target.value)}
                >
                  <MenuItem value="rename">Rename Column</MenuItem>
                  <MenuItem value="convert">Convert Data Type</MenuItem>
                  <MenuItem value="filter">Filter Rows</MenuItem>
                  <MenuItem value="calculate">Calculate New Column</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {transformOperation === 'rename' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Column Name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  margin="normal"
                />
              </Grid>
            )}
            
            {transformOperation === 'convert' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Convert To</InputLabel>
                  <Select
                    value={dataType}
                    label="Convert To"
                    onChange={(e) => setDataType(e.target.value)}
                  >
                    <MenuItem value="string">Text (String)</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean (True/False)</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {transformOperation === 'filter' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Filter Operator</InputLabel>
                    <Select
                      value={filterOperator}
                      label="Filter Operator"
                      onChange={(e) => setFilterOperator(e.target.value)}
                    >
                      <MenuItem value="equals">Equals</MenuItem>
                      <MenuItem value="not_equals">Not Equals</MenuItem>
                      <MenuItem value="greater_than">Greater Than</MenuItem>
                      <MenuItem value="less_than">Less Than</MenuItem>
                      <MenuItem value="contains">Contains</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Filter Value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            {transformOperation === 'calculate' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Column Name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Formula"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    margin="normal"
                    placeholder="{column1} + {column2}"
                    helperText="Use {columnName} to reference columns"
                  />
                </Grid>
              </>
            )}
          </Grid>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleAddTransformation}
            >
              Add Transformation
            </Button>
          </Box>
          
          {transformations.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Current Transformations</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Column</TableCell>
                      <TableCell>Operation</TableCell>
                      <TableCell>Parameters</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transformations.map((transform, index) => (
                      <TableRow key={index}>
                        <TableCell>{transform.column}</TableCell>
                        <TableCell>{transform.operation}</TableCell>
                        <TableCell>
                          {Object.entries(transform.params).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => removeTransformation(index)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransform}>Cancel</Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => {
              // Apply transformations to preview data
              const transformedData = applyTransformations(previewData);
              setPreviewData(transformedData);
              
              // Update columns if needed
              if (transformedData.length > 0) {
                setPreviewColumns(Object.keys(transformedData[0]));
              }
              
              // Update column types
              const newTypes = detectColumnTypes(transformedData);
              setColumnTypes(newTypes);
              
              // Close transform dialog
              setShowTransform(false);
              
              // Show success message
              setSnackbarMessage('Transformations applied successfully');
              setSnackbarOpen(true);
            }}
          >
            Apply Transformations
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Apply transformations before uploading
  const handleTransformedUpload = () => {
    if (transformations.length > 0 && previewData) {
      // Apply transformations to preview data
      const transformedData = applyTransformations(previewData);
      
      // Update preview with transformed data
      setPreviewData(transformedData);
      
      // Update column types
      const newTypes = detectColumnTypes(transformedData);
      setColumnTypes(newTypes);
      
      // Close transform dialog
      setShowTransform(false);
      
      // Show success message
      setSnackbarMessage('Transformations applied successfully');
      setSnackbarOpen(true);
    } else {
      handleUpload();
    }
  };
  
  return (
    <div className="p-4">
      <Typography variant="h4" component="h1" gutterBottom className="font-bold">
        Data Upload
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-400 mb-8">
        Upload your data or connect to external data sources
      </Typography>
      
      {/* Upload methods */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} md={4}>
          <Paper 
            className={`data-card p-6 flex flex-col items-center justify-center h-48 cursor-pointer ${uploadMethod === 'file' ? 'border-2 border-primary' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <UploadFileIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h6" className="mt-4">Upload File</Typography>
            <Typography variant="body2" className="text-center text-gray-400 mt-2">
              Upload CSV, JSON, Excel or Parquet files
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            className={`data-card p-6 flex flex-col items-center justify-center h-48 cursor-pointer ${uploadMethod === 'url' ? 'border-2 border-primary' : ''}`}
            onClick={() => setUploadMethod('url')}
          >
            <LinkIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h6" className="mt-4">Data URL</Typography>
            <Typography variant="body2" className="text-center text-gray-400 mt-2">
              Import data from a URL
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            className={`data-card p-6 flex flex-col items-center justify-center h-48 cursor-pointer ${uploadMethod === 'database' ? 'border-2 border-primary' : ''}`}
            onClick={() => setUploadMethod('database')}
          >
            <DatabaseIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h6" className="mt-4">Connect Database</Typography>
            <Typography variant="body2" className="text-center text-gray-400 mt-2">
              Connect to database or API
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Error and warning messages */}
      {error && (
        <Alert severity="error" className="mb-4" icon={<ErrorIcon />}>
          {error}
        </Alert>
      )}
      
      {warnings.length > 0 && (
        <Alert severity="warning" className="mb-4" icon={<WarningIcon />}>
          <Typography variant="subtitle2">Warnings:</Typography>
          <ul className="pl-4">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {/* Upload options based on method */}
      <Paper className="data-card p-6 mb-8">
        {uploadMethod === 'file' && (
          <>
            <Typography variant="h6" className="mb-4">Upload File</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="File Type"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  variant="outlined"
                  margin="normal"
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="parquet">Parquet</MenuItem>
                </TextField>
                
                {fileType === 'csv' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hasHeader}
                        onChange={(e) => setHasHeader(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="First row contains headers"
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="mt-4">
                  <input
                    type="file"
                    accept={fileType === 'csv' ? '.csv' : 
                            fileType === 'json' ? '.json' : 
                            fileType === 'excel' ? '.xlsx,.xls' : 
                            '.parquet'}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={triggerFileInput}
                    fullWidth
                  >
                    Choose File
                  </Button>
                  {selectedFile && (
                    <Box className="mt-2 flex items-center justify-between">
                      <Typography variant="body2">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </Typography>
                      <Box>
                        <Tooltip title="Preview Data">
                          <IconButton size="small" onClick={() => setShowPreview(true)} color="primary">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove File">
                          <IconButton size="small" onClick={() => setSelectedFile(null)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </>
        )}
        
        {uploadMethod === 'url' && (
          <>
            <Typography variant="h6" className="mb-4">Data URL</Typography>
            <TextField
              fullWidth
              label="URL to data source"
              value={dataUrl}
              onChange={(e) => setDataUrl(e.target.value)}
              variant="outlined"
              margin="normal"
              placeholder="https://example.com/data.csv"
              helperText="Enter a URL to a CSV, JSON, or other data file"
              error={dataUrl !== '' && !dataUrl.startsWith('http')}
            />
          </>
        )}
        
        {uploadMethod === 'database' && (
          <>
            <Typography variant="h6" className="mb-4">Connect to Database</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Data Source Type"
                  value={dataSourceType}
                  onChange={(e) => setDataSourceType(e.target.value)}
                  variant="outlined"
                  margin="normal"
                >
                  {mockDataSources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Connection String"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  placeholder={dataSourceType === 'mysql' ? 'mysql://user:password@host:port/database' : 
                              dataSourceType === 'mongodb' ? 'mongodb://user:password@host:port/database' :
                              dataSourceType === 'postgres' ? 'postgresql://user:password@host:port/database' :
                              'Enter connection details'}
                  helperText={
                    <>
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {dataSourceType === 'api' ? 'Enter API endpoint URL' : 
                       dataSourceType === 'googlesheets' ? 'Enter Google Sheets URL or ID' :
                       'Enter connection string for your database'}
                    </>
                  }
                />
              </Grid>
              {dataSourceType && connectionString && (
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={() => {
                      setLoading(true);
                      // Simulate testing connection
                      setTimeout(() => {
                        setLoading(false);
                        setSnackbarMessage('Connection test successful!');
                        setSnackbarOpen(true);
                      }, 1500);
                    }}
                  >
                    Test Connection
                  </Button>
                </Grid>
              )}
              {dataSourceType && (
                <Grid item xs={12}>
                  <Alert severity="info" className="mt-2" icon={<InfoIcon />}>
                    <Typography variant="subtitle2">Connection Information</Typography>
                    {dataSourceType === 'mysql' && (
                      <Typography variant="body2">
                        MySQL connections require host, port, database name, username and password.
                      </Typography>
                    )}
                    {dataSourceType === 'postgres' && (
                      <Typography variant="body2">
                        PostgreSQL connections require host, port, database name, username and password.
                      </Typography>
                    )}
                    {dataSourceType === 'mongodb' && (
                      <Typography variant="body2">
                        MongoDB connections require host, port, database name, and optional authentication.
                      </Typography>
                    )}
                    {dataSourceType === 'api' && (
                      <Typography variant="body2">
                        API connections require a valid endpoint URL and may need authentication.
                      </Typography>
                    )}
                    {dataSourceType === 'googlesheets' && (
                      <Typography variant="body2">
                        Google Sheets connections require a sheet ID or URL and may need authentication.
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </>
        )}
        
        <Divider className="my-4" />
        
        <Box className="mt-4 flex justify-end">
          <Button
            variant="contained"
            color="primary"
            disabled={loading || 
                     (uploadMethod === 'file' && !selectedFile) ||
                     (uploadMethod === 'url' && !dataUrl) ||
                     (uploadMethod === 'database' && (!dataSourceType || !connectionString))}
            onClick={handleUpload}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {loading ? 'Uploading...' : 'Upload Data'}
          </Button>
        </Box>
        
        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {progress}% Complete
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Success message */}
      {success && (
        <Alert severity="success" className="mb-4" icon={<CheckCircleIcon />}>
          Data uploaded successfully! You can now proceed to analysis.
        </Alert>
      )}
      
      {/* Render data preview dialog */}
      {renderDataPreview()}
      
      {/* Render data transformation dialog */}
      {renderTransformDialog()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
};

export default DataUpload;