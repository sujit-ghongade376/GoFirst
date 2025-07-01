import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      width: '100%',
      bgcolor: 'background.paper',
      py: 2,
      px: 2,
      mt: 'auto',
      textAlign: 'center',
      boxShadow: 1,
      fontSize: { xs: 12, sm: 14 },
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <span>© {new Date().getFullYear()} GoFirst</span>
      <span style={{ fontSize: 18, color: '#1976d2' }}>🚀</span>
      <span>by Sujit Ghongade & Team. All rights reserved.</span>
    </Typography>
  </Box>
);

export default Footer;
