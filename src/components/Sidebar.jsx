import { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Sidebar = ({ collapsed }) => {
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
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: 2,
            height: '64px',
          }}
        >
          {!collapsed && (
            <Box component={Link} to="/" sx={{ textDecoration: 'none', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InsightsIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                <Box sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>DeepStats</Box>
              </Box>
            </Box>
          )}
          {collapsed && (
            <Tooltip title="DeepStatistics" placement="right">
              <Box component={Link} to="/">
                <InsightsIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>
            </Tooltip>
          )}
        </Box>
        <Divider />
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
                  backgroundColor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  borderLeft: location.pathname === item.path ? '3px solid #6366f1' : 'none',
                }}
              >
                <Tooltip title={collapsed ? item.text : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 3,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
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
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <Divider />
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
                }}
              >
                <Tooltip title={collapsed ? item.text : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 3,
                      justifyContent: 'center',
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