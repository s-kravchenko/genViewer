import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { FileImport, FileImportDetails } from '@shared/models';
import { fetchFileImports, fetchFileImportDetails as fetchImportDetails } from 'src/api/importApi';

interface State {
  imports: FileImport[];
  currentImportId: string | null;
  currentImport: FileImportDetails | null;
  ui: {
    loading: boolean;
    error: string | null;
  };
}

type Action =
  | { type: 'LOADING_START' }
  | { type: 'LOADING_ERROR'; error: string }
  | { type: 'SET_IMPORTS'; payload: FileImport[] }
  | { type: 'SET_CURRENT_IMPORT_ID'; payload: string }
  | { type: 'SET_CURRENT_IMPORT'; payload: FileImportDetails };

function importReducer(state: State, action: Action) {
  switch (action.type) {
    case 'LOADING_START':
      return { ...state, ui: { loading: true, error: null } };
    case 'LOADING_ERROR':
      return { ...state, ui: { loading: false, error: action.error } };
    case 'SET_IMPORTS':
      return { ...state, imports: action.payload, ui: { ...state.ui, loading: false } };
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
  imports: [],
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
    fetchFileImports()
      .then((data) => dispatch({ type: 'SET_IMPORTS', payload: data }))
      .catch((err) => dispatch({ type: 'LOADING_ERROR', error: err.message }));
  };

  const selectImport = async (importId: string) => {
    dispatch({ type: 'SET_CURRENT_IMPORT_ID', payload: importId });
    dispatch({ type: 'LOADING_START' });
    try {
      const importDetails = await fetchImportDetails(importId);
      dispatch({ type: 'SET_CURRENT_IMPORT', payload: importDetails });
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
