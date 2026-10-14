import { useEffect, useState } from 'react';
import { Alert, Box, Button, LinearProgress, Pagination, Paper, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiRequest } from '../api/client';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseList from '../components/ExpenseList';
import ExpenseFormDialog from '../components/ExpenseFormDialog';
import DeleteExpenseDialog from '../components/DeleteExpenseDialog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useExpenses } from '../hooks/useExpenses';
import { selectActiveFilterCount, selectFilters, setPage, toQueryString, updateFilters } from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Category, Expense } from '../types';

export default function Expenses() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const activeFilterCount = useAppSelector(selectActiveFilterCount);

  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Redux updates on every keystroke, but we only ask the server once typing pauses.
  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const queryString = toQueryString({ ...filters, search: debouncedSearch });
  const { expenses, pagination, isLoading, error, reload } = useExpenses(queryString);

  // Categories feed the filter dropdown and the form, so load them once.
  useEffect(() => {
    let cancelled = false;
    apiRequest<{ categories: Category[] }>('/categories')
      .then((data) => {
        if (!cancelled) setCategories(data.categories);
      })
      .catch(() => {
        // Not fatal here: the list shows its own error if the API is down.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const stale =
      categories.length > 0 &&
      filters.categoryId !== '' &&
      !categories.some((category) => String(category.id) === filters.categoryId);
    if (stale) dispatch(updateFilters({ categoryId: '' }));
  }, [categories, filters.categoryId, dispatch]);

  function openAddForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  function handleSaved(message: string) {
    setFormOpen(false);
    setEditing(null);
    setToast(message);
    reload(); // fetch the fresh list
  }

  function handleDeleted() {
    // If that was the last item on a later page, step back one page instead of showing an empty one.
    const wasLastOnPage = expenses.length === 1 && filters.page > 1;
    setDeleting(null);
    setToast('Expense deleted');
    if (wasLastOnPage) dispatch(setPage(filters.page - 1));
    else reload();
  }

  // Show the range of expenses being displayed, e.g. "Showing 11–20 of 42".
  const rangeText = pagination && pagination.total > 0
    ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
        pagination.page * pagination.limit,
        pagination.total
      )} of ${pagination.total}`
    : '';

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4">Expenses</Typography>
          <Typography color="text.secondary">{rangeText || 'Track every purchase in one place.'}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddForm}>
          Add expense
        </Button>
      </Box>

      <ExpenseFilters categories={categories} />

      {/* Thin loading bar; its box keeps its height so the page doesn't jump */}
      <Box sx={{ height: 4, mb: 1 }}>{isLoading && <LinearProgress />}</Box>

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {!error && !isLoading && expenses.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {activeFilterCount > 0 ? 'No expenses match these filters' : 'No expenses yet'}
          </Typography>
          <Typography color="text.secondary">
            {activeFilterCount > 0
              ? 'Try loosening or clearing a filter.'
              : 'Add your first expense to start tracking.'}
          </Typography>
        </Paper>
      )}

      {expenses.length > 0 && (
        <ExpenseList expenses={expenses} isLoading={isLoading} onEdit={openEditForm} onDelete={setDeleting} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            color="primary"
            onChange={(_event, page) => {
              dispatch(setPage(page)); // the page number lives in Redux with the other filters
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Box>
      )}

      {formOpen && (
        <ExpenseFormDialog
          categories={categories}
          expense={editing}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <DeleteExpenseDialog expense={deleting} onCancel={() => setDeleting(null)} onDeleted={handleDeleted} />
      )}

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} message={toast ?? ''} />
    </>
  );
}