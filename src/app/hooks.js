import { useDispatch, useSelector } from 'react-redux';

// Типізовані за змістом хуки: імпортуються з app/hooks, а не з react-redux
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
