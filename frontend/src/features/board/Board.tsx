import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Box, Paper, Typography, Stack, Button, useTheme, Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import TicketCard from '@/features/tickets/TicketCard';
import Searchbar from '@/components/Searchbar';
import TicketFormModal from '@/features/tickets/TicketFormModal';
import type { TicketFormValues } from '@/features/tickets/TicketFormModal';
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} from '@/app/api/ticketsApi';
import type { Ticket } from '@/app/api/ticketsApi';

const stages = ['To Do', 'In Progress', 'Review', 'Done'];

const getStageColors = (mode: 'light' | 'dark') => ({
  'To Do': mode === 'dark' ? '#1976d2' : '#e3f2fd',
  'In Progress': mode === 'dark' ? '#bdb800' : '#fff9c4',
  'Review': mode === 'dark' ? '#ff9800' : '#ffe0b2',
  'Done': mode === 'dark' ? '#388e3c' : '#c8e6c9',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: 400,
  background: theme.palette.grey[100],
  transition: 'background 0.3s',
}));

const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Critical'];
const statusOptions = ['All', ...stages];

const Board = () => {
  const theme = useTheme();
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editTicket, setEditTicket] = React.useState<Ticket | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: true });
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [deleteTicket] = useDeleteTicketMutation();
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; ticket: Ticket | null }>({ open: false, ticket: null });
  const [priorityFilter, setPriorityFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [assigneeFilter, setAssigneeFilter] = React.useState('All');

  const stageColors = getStageColors(theme.palette.mode);

  // Enable polling every 5 seconds for real-time updates
  const { data: tickets = [], isLoading, isError, refetch } = useGetTicketsQuery(undefined, { pollingInterval: 5000 });
  const [createTicket] = useCreateTicketMutation();
  const [updateTicket] = useUpdateTicketMutation();

  const onDragEnd = async (result: DropResult) => {
    setDraggingId(null);
    if (!result.destination) return;
    const ticketId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const ticket = tickets.find(t => String(t.id) === ticketId);
    if (ticket && ticket.status !== newStatus) {
      await updateTicket({ ...ticket, status: newStatus, id: ticketId });
      setSnackbar({ open: true, message: 'Ticket status updated!', success: true });
    }
  };

  const onDragStart = (start: { draggableId: string }) => {
    setDraggingId(start.draggableId);
  };

  const handleCreate = () => {
    setEditTicket(null);
    setModalOpen(true);
  };

  const handleEdit = (ticket: Ticket) => {
    setEditTicket(ticket);
    setModalOpen(true);
  };

  const handleSubmit = async (values: TicketFormValues) => {
    try {
      if (editTicket) {
        await updateTicket({ ...editTicket, ...values, dueDate: values.dueDate ?? null, id: editTicket.id });
        setSnackbar({ open: true, message: 'Ticket updated successfully!', success: true });
      } else {
        await createTicket({ ...values, dueDate: values.dueDate ?? null }).unwrap();
        setSnackbar({ open: true, message: 'Ticket created successfully!', success: true });
      }
      setModalOpen(false);
      refetch();
      return true;
    } catch (e) {
      setSnackbar({ open: true, message: 'Operation failed!', success: false });
      return false;
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.ticket) {
      try {
        await deleteTicket(deleteDialog.ticket.id).unwrap();
        setSnackbar({ open: true, message: 'Ticket deleted successfully!', success: true });
        setDeleteDialog({ open: false, ticket: null });
        refetch();
      } catch {
        setSnackbar({ open: true, message: 'Failed to delete ticket!', success: false });
      }
    }
  };

  // Get unique assignees from tickets
  const assigneeOptions = React.useMemo(() => {
    const set = new Set<string>();
    tickets.forEach(t => { if (t.assignee) set.add(t.assignee); });
    return ['All', ...Array.from(set)];
  }, [tickets]);

  const filteredTickets = tickets.filter(
    t =>
      (t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())) &&
      (priorityFilter === 'All' || t.priority === priorityFilter) &&
      (statusFilter === 'All' || t.status === statusFilter) &&
      (assigneeFilter === 'All' || t.assignee === assigneeFilter)
  );

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', rowGap: 2 }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 }, mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 } }}>
          <Searchbar value={search} onChange={setSearch} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 140, mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel>Priority</InputLabel>
          <Select
            label="Priority"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            {priorityOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140, mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140, mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel>Assignee</InputLabel>
          <Select
            label="Assignee"
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
          >
            {assigneeOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleCreate} sx={{ whiteSpace: 'nowrap', minWidth: 180, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
          Create New Ticket
        </Button>
      </Stack>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box color="error.main" textAlign="center">Failed to load tickets.</Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch" width="100%">
            {stages.map((stage) => (
              <Box key={stage} flex={1} minWidth={0} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="h6" align="center" gutterBottom>{stage}</Typography>
                <Droppable droppableId={stage}>
                  {(provided) => (
                    <StyledPaper ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: { xs: 200, sm: 300, md: 400 }, p: { xs: 1, sm: 2 } }}>
                      {filteredTickets.filter(t => t.status === stage).map((ticket, idx) => (
                        <Draggable key={String(ticket.id)} draggableId={String(ticket.id)} index={idx}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={e => { e.stopPropagation(); handleEdit(ticket); }}
                            >
                              <TicketCard
                                title={ticket.title}
                                description={ticket.description}
                                ticketNumber={ticket.ticketNumber || String(ticket.id)}
                                assignee={ticket.assignee}
                                dueDate={ticket.dueDate}
                                priority={ticket.priority}
                                bgColor={
                                  draggingId === String(ticket.id)
                                    ? '#b3e5fc'
                                    : stageColors[ticket.status as keyof typeof stageColors] || '#fff'
                                }
                                onDelete={() => setDeleteDialog({ open: true, ticket })}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </StyledPaper>
                  )}
                </Droppable>
              </Box>
            ))}
          </Stack>
        </DragDropContext>
      )}
      <TicketFormModal
        open={modalOpen}
        initialValues={
          editTicket
            ? {
                title: editTicket.title,
                description: editTicket.description,
                status: editTicket.status,
                assignee: editTicket.assignee,
                dueDate: editTicket.dueDate ? String(editTicket.dueDate) : null,
                priority: editTicket.priority || 'Low',
                id: editTicket.id,
              }
            : undefined
        }
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isEdit={!!editTicket}
      />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, ticket: null })}>
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this ticket?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, ticket: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Board;
