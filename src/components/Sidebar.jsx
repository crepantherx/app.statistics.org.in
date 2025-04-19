import { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip, IconButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';

const Sidebar = ({ collapsed, onMenuClick }) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Upload Data', icon: <UploadFileIcon />, path: '/upload' },
    { text: 'Analysis', icon: <AnalyticsIcon />, path: '/analysis' },
    { text: 'Visualization', icon: <BarChartIcon />, path: '/visualization' },
    { text: 'AI Insights', icon: <InsightsIcon />, path: '/insights' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  ];

  const bottomMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpOutlineIcon />, path: '/help' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        width: collapsed ? '64px' : '240px',
        bgcolor: 'background.paper',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <Box>
        <Box
          sx={{
            position: 'relative',
            height: '48px',
            width: '100%',
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <IconButton
            size="small"
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onMenuClick}
            sx={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  bgcolor: location.pathname === item.path ? 'rgba(0, 162, 255, 0.1)' : 'transparent',
                  borderLeft: location.pathname === item.path ? '3px solid #00a2ff' : 'none',
                  '&:hover': {
                    bgcolor: 'rgba(0, 162, 255, 0.05)',
                  }
                }}
              >
                <Tooltip title={collapsed ? item.text : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 3,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                {!collapsed && (
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      opacity: collapsed ? 0 : 1,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <List>
          {bottomMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 162, 255, 0.05)',
                  }
                }}
              >
                <Tooltip title={collapsed ? item.text : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 3,
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                {!collapsed && <ListItemText primary={item.text} sx={{ opacity: collapsed ? 0 : 1 }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;