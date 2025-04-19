import { Box } from '@mui/material';

const PageWrapper = ({ children }) => {
  return (
    <Box
      sx={{
        margin: '25px',
        padding: '25px',
        height: 'calc(100% - 50px)', // Account for margins
        overflow: 'auto',
      }}
    >
      {children}
    </Box>
  );
};

export default PageWrapper; 