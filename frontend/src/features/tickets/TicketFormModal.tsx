import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Snackbar, Alert, Divider, List, ListItem, ListItemText, Typography as MuiTypography, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetCommentsQuery, useAddCommentMutation, useGetActivitiesQuery, useGetAttachmentsQuery, useUploadAttachmentMutation, useDeleteAttachmentMutation } from '@/app/api/ticketsApi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const statusOptions = ['To Do', 'In Progress', 'Review', 'Done'];
const userOptions = [
  'sujit ghongade',
  'pallavi mashalkar',
  'nitesh rathod',
  'rishabh roy',
  'sunil algude',
  'vivek pahane',
];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.string(),
  assignee: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().optional().nullable(),
  priority: z.string().min(1, 'Priority is required'),
});

export type TicketFormValues = z.infer<typeof schema>;

interface TicketFormModalProps {
  open: boolean;
  initialValues?: TicketFormValues & { id?: string | number };
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => Promise<boolean> | boolean;
  isEdit?: boolean;
}

const TicketFormModal: React.FC<TicketFormModalProps> = ({ open, initialValues, onClose, onSubmit, isEdit }) => {
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; success: boolean; message: string }>({ open: false, success: true, message: '' });
  const { control, handleSubmit, reset } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || { title: '', description: '', status: statusOptions[0], assignee: userOptions[0], dueDate: '', priority: priorityOptions[0] },
  });

  // Comments logic
  const ticketId = initialValues?.id;
  const { data: comments = [], refetch: refetchComments } = useGetCommentsQuery(ticketId!, { skip: !ticketId });
  const [addComment] = useAddCommentMutation();
  const [commentText, setCommentText] = React.useState('');
  const [commentAuthor, setCommentAuthor] = React.useState('');
  const [commentError, setCommentError] = React.useState('');

  // Activity logic
  const { refetch: refetchActivities } = useGetActivitiesQuery(ticketId!, { skip: !ticketId });

  React.useEffect(() => {
    reset(initialValues || { title: '', description: '', status: statusOptions[0], assignee: userOptions[0], dueDate: '', priority: priorityOptions[0] });
  }, [initialValues, open, reset]);

  const handleFormSubmit = async (data: TicketFormValues) => {
    const result = await onSubmit(data);
    setSnackbar({ open: true, success: !!result, message: result ? (isEdit ? 'Ticket updated!' : 'Ticket created!') : 'Operation failed.' });
    if (result) {
      refetchActivities();
      // Do not close the modal automatically after update
      // onClose();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !commentAuthor.trim()) {
      setCommentError('Author and comment are required.');
      return;
    }
    if (!ticketId) {
      setCommentError('Ticket ID missing.');
      return;
    }
    try {
      await addComment({ ticketId, author: commentAuthor, text: commentText }).unwrap();
      setCommentText('');
      setCommentAuthor('');
      setCommentError('');
      refetchComments();
      refetchActivities();
      // Do not close the modal automatically after comment
    } catch {
      setCommentError('Failed to add comment.');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: { xs: '100vw', sm: 600 },
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>{isEdit ? 'Edit Ticket' : 'Create Ticket'}</DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Title" fullWidth margin="normal" error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Description" fullWidth margin="normal" multiline rows={3} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Status" select fullWidth margin="normal">
                  {statusOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="assignee"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Assignee" select fullWidth margin="normal" error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {userOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => {
                const value = field.value ? (dayjs(field.value).isValid() ? dayjs(field.value) : null) : null;
                if (field.value && !dayjs(field.value).isValid()) {
                  // eslint-disable-next-line no-console
                  console.warn('Invalid dueDate value for DatePicker:', field.value);
                }
                return (
                  <>
                    <DatePicker
                      label="Due Date"
                      value={value}
                      onChange={date => {
                        field.onChange(date && dayjs.isDayjs(date) && date.isValid() ? date.toISOString() : null);
                      }}
                      onAccept={() => field.onBlur()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: 'normal',
                          InputLabelProps: { shrink: true },
                          onBlur: field.onBlur,
                        },
                      }}
                      onClose={field.onBlur}
                    />
                    {field.value && !dayjs(field.value).isValid() && (
                      <MuiTypography color="error" variant="body2">
                        Invalid due date value: {String(field.value)}
                      </MuiTypography>
                    )}
                  </>
                );
              }}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Priority" select fullWidth margin="normal" error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {priorityOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            {/* Attachments Section */}
            {isEdit && ticketId !== undefined && ticketId !== null && (
              <>
                <Divider sx={{ my: 2 }} />
                <MuiTypography variant="subtitle1" gutterBottom>Attachments</MuiTypography>
                <AttachmentsSection ticketId={ticketId} />
              </>
            )}
            {/* Comments Section */}
            {isEdit && ticketId !== undefined && ticketId !== null && (
              <>
                <Divider sx={{ my: 2 }} />
                <MuiTypography variant="subtitle1" gutterBottom>Activity Log</MuiTypography>
                <ActivityLog ticketId={ticketId} />
                <Divider sx={{ my: 2 }} />
                <MuiTypography variant="subtitle1" gutterBottom>Comments</MuiTypography>
                <List dense>
                  {comments.length === 0 && <ListItem><ListItemText primary="No comments yet." /></ListItem>}
                  {comments.map(comment => (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemText
                        primary={<><b>{comment.author}</b> <span style={{ fontSize: 12, color: '#888' }}>{new Date(comment.createdAt).toLocaleString()}</span></>}
                        secondary={comment.text}
                      />
                    </ListItem>
                  ))}
                </List>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-end" sx={{ mt: 1 }}>
                  <TextField
                    label="Your Name"
                    value={commentAuthor}
                    onChange={e => setCommentAuthor(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Add a comment"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    size="small"
                    sx={{ flex: 2 }}
                  />
                  <Button variant="outlined" onClick={handleAddComment}>Add</Button>
                </Stack>
                {commentError && <MuiTypography color="error" variant="body2">{commentError}</MuiTypography>}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={onClose} fullWidth={true} sx={{ mb: { xs: 1, sm: 0 } }}>Cancel</Button>
            <Button type="submit" variant="contained" fullWidth={true}>{isEdit ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// ActivityLog component
const ActivityLog: React.FC<{ ticketId: string | number }> = ({ ticketId }) => {
  const { data: activities = [], isLoading, error } = useGetActivitiesQuery(ticketId, { skip: !ticketId });
  const [showAll, setShowAll] = React.useState(false);
  if (!ticketId) return <MuiTypography color="error">No ticket ID for activity log.</MuiTypography>;
  if (isLoading) return <MuiTypography variant="body2">Loading activity...</MuiTypography>;
  if (error) return <MuiTypography color="error">Failed to load activity log.</MuiTypography>;
  if (!activities.length) return <MuiTypography variant="body2">No activity yet.</MuiTypography>;
  const display = showAll ? [...activities].reverse() : activities.slice(-2).reverse();
  return (
    <>
      <List dense>
        {display.map(act => (
          <ListItem key={act.id}>
            <ListItemText
              primary={<>{act.message}</>}
              secondary={new Date(act.createdAt).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
      {activities.length > 2 && (
        <Button size="small" onClick={() => setShowAll(v => !v)} sx={{ mt: 1 }}>
          {showAll ? 'Show less' : 'View all'}
        </Button>
      )}
    </>
  );
};

// AttachmentsSection component
const AttachmentsSection: React.FC<{ ticketId: string | number }> = ({ ticketId }) => {
  const { data: attachments = [], refetch, isLoading } = useGetAttachmentsQuery(ticketId, { skip: !ticketId });
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState('');

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadAttachment({ ticketId, file }).unwrap();
      setFile(null);
      setError('');
      refetch();
    } catch {
      setError('Failed to upload file.');
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      await deleteAttachment({ attachmentId }).unwrap();
      refetch();
    } catch {
      setError('Failed to delete attachment.');
    }
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <input
          type="file"
          onChange={e => setFile(e.target.files?.[0] || null)}
          style={{ display: 'inline-block' }}
        />
        <Button
          variant="contained"
          size="small"
          disabled={!file || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Stack>
      {error && <MuiTypography color="error" variant="body2">{error}</MuiTypography>}
      {isLoading ? (
        <MuiTypography variant="body2">Loading attachments...</MuiTypography>
      ) : attachments.length === 0 ? (
        <MuiTypography variant="body2">No attachments yet.</MuiTypography>
      ) : (
        <List dense>
          {attachments.map(att => (
            <ListItem key={att.id} secondaryAction={
              <Button color="error" size="small" onClick={() => handleDelete(att.id)}>Delete</Button>
            }>
              <ListItemText
                primary={<a href={`/${att.filepath}`} target="_blank" rel="noopener noreferrer">{att.filename}</a>}
                secondary={new Date(att.uploadedAt).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};

export default TicketFormModal;
