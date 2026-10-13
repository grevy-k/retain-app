import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

// Pre-typed versions of the Redux hooks, so components get autocomplete and type checks for free.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();