import { Card, CardContent, Typography, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  marginBottom: theme.spacing(2),
  background: bgcolor || theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'background 0.3s',
  width: '100%',
  maxWidth: 480,
  minWidth: 0,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    minWidth: 0,
    marginBottom: theme.spacing(1.5),
  },
}));

// Priority color mapping
const priorityColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  Low: 'success',
  Medium: 'info',
  High: 'warning',
  Critical: 'error',
};

interface TicketCardProps {
  title: string;
  description: string;
  ticketNumber: string | number;
  assignee?: string;
  dueDate?: string | null;
  priority?: string;
  bgColor?: string;
  onDelete?: () => void;
}

const TicketCard = ({ title, description, ticketNumber, assignee, dueDate, priority, bgColor, onDelete }: TicketCardProps) => (
  <StyledCard bgcolor={bgColor}>
    <CardContent sx={{ position: 'relative', pb: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {`TKT-${ticketNumber}`}
      </Typography>
      {onDelete && (
        <IconButton
          aria-label="delete"
          size="small"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
      <Typography variant="h6">{title}</Typography>
      {assignee && (
        <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
          Assignee: {assignee}
        </Typography>
      )}
      {priority && (
        <Chip
          label={priority}
          color={priorityColors[priority] || 'default'}
          size="small"
          sx={{ mb: 0.5, fontWeight: 700 }}
        />
      )}
      {dueDate && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Due: {new Date(dueDate).toLocaleDateString()}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </StyledCard>
);

export default TicketCard;
