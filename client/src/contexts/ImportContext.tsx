import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { DataImport, DataImportDetails } from '@shared/models';
import { fetchDataImports, fetchDataImportDetails } from 'src/api/importApi';

interface State {
  dataImports: DataImport[];
  currentImportId: string | null;
  currentImport: DataImportDetails | null;
  ui: {
    loading: boolean;
    error: string | null;
  };
}

type Action =
  | { type: 'LOADING_START' }
  | { type: 'LOADING_ERROR'; error: string }
  | { type: 'SET_DATA_IMPORTS'; payload: DataImport[] }
  | { type: 'SET_CURRENT_IMPORT_ID'; payload: string }
  | { type: 'SET_CURRENT_IMPORT'; payload: DataImportDetails };

function importReducer(state: State, action: Action) {
  switch (action.type) {
    case 'LOADING_START':
      return { ...state, ui: { loading: true, error: null } };
    case 'LOADING_ERROR':
      return { ...state, ui: { loading: false, error: action.error } };
    case 'SET_DATA_IMPORTS':
      return { ...state, dataImports: action.payload, ui: { ...state.ui, loading: false } };
    case 'SET_CURRENT_IMPORT_ID':
      return { ...state, currentImportId: action.payload };
    case 'SET_CURRENT_IMPORT':
      return { ...state, currentImport: action.payload };
    default:
      return state;
  }
}

// Context shape
interface ImportContextType {
  state: State;
  actions: {
    fetchImports: () => Promise<void>;
    selectImport: (importId: string) => Promise<void>;
  };
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

// Initial state
const initialState: State = {
  dataImports: [],
  currentImportId: null,
  currentImport: null,
  ui: {
    loading: false,
    error: null,
  },
};

// Provider
export function ImportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(importReducer, initialState);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    dispatch({ type: 'LOADING_START' });
    fetchDataImports()
      .then((data) => dispatch({ type: 'SET_DATA_IMPORTS', payload: data }))
      .catch((err) => dispatch({ type: 'LOADING_ERROR', error: err.message }));
  };

  const selectImport = async (importId: string) => {
    dispatch({ type: 'SET_CURRENT_IMPORT_ID', payload: importId });
    dispatch({ type: 'LOADING_START' });
    try {
      const dataImportDetails = await fetchDataImportDetails(importId);
      dispatch({ type: 'SET_CURRENT_IMPORT', payload: dataImportDetails });
    } catch (err: any) {
      dispatch({ type: 'LOADING_ERROR', error: err.message });
    }
  };

  return (
    <ImportContext.Provider value={{ state, actions: { fetchImports, selectImport } }}>
      {children}
    </ImportContext.Provider>
  );
}

export default ImportContext;
