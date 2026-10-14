import { useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, IconButton, Paper, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryFormDialog from './CategoryFormDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useApi } from '../hooks/useApi';
import type { Category } from '../types';

export default function CategoriesTab() {
  const { data, isLoading, error, reload } = useApi<{ categories: Category[] }>('/categories');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openRename(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function handleSaved(message: string) {
    setFormOpen(false);
    setEditing(null);
    setToast(message);
    reload();
  }

  function handleDeleted(message: string) {
    setDeleting(null);
    setToast(message);
    reload();
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography color="text.secondary">
          {data.categories.length} categories. Everyone on the platform picks from this list.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add category
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.categories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{category.name}</TableCell>
                <TableCell>
                  {category.is_default ? <Chip size="small" color="primary" label="Default" /> : <Chip size="small" label="Custom" />}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {category.is_default ? (
                    // The fallback category must always exist, so it can't be changed.
                    <Typography variant="caption" color="text.secondary">Protected</Typography>
                  ) : (
                    <>
                      <Tooltip title="Rename">
                        <IconButton size="small" aria-label={`Rename ${category.name}`} onClick={() => openRename(category)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" aria-label={`Delete ${category.name}`} onClick={() => setDeleting(category)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {formOpen && (
        <CategoryFormDialog category={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
      )}
      {deleting && (
        <DeleteCategoryDialog category={deleting} onCancel={() => setDeleting(null)} onDeleted={handleDeleted} />
      )}

      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}