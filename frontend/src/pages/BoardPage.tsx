import { Container, Box } from '@mui/material';
import Board from '@/features/board/Board';
import Header from '@/components/Header';

const BoardPage = () => (
  <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
    <Header />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Board />
    </Container>
  </Box>
);

export default BoardPage;
