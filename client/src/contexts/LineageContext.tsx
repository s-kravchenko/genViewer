import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { Lineage } from '@shared/models';
import { fetchLineages, fetchLineage } from 'src/api/lineageApi';

interface State {
  lineages: Lineage[];
  currentLineageId: string | null;
  currentLineage: Lineage | null;
  ui: {
    loading: boolean;
    error: string | null;
  };
}

type Action =
  | { type: 'LOADING_START' }
  | { type: 'LOADING_ERROR'; error: string }
  | { type: 'SET_LINEAGES'; payload: Lineage[] }
  | { type: 'SET_CURRENT_LINEAGE_ID'; payload: string }
  | { type: 'SET_CURRENT_LINEAGE'; payload: Lineage };

function lineageReducer(state: State, action: Action) {
  switch (action.type) {
    case 'LOADING_START':
      return { ...state, ui: { loading: true, error: null } };
    case 'LOADING_ERROR':
      return { ...state, ui: { loading: false, error: action.error } };
    case 'SET_LINEAGES':
      return { ...state, lineages: action.payload, ui: { ...state.ui, loading: false } };
    case 'SET_CURRENT_LINEAGE_ID':
      return { ...state, currentLineageId: action.payload };
    case 'SET_CURRENT_LINEAGE':
      return { ...state, currentLineage: action.payload };
    default:
      return state;
  }
}

// Context shape
interface LineageContextType {
  state: State;
  actions: {
    fetchLineages: () => Promise<void>;
    selectLineage: (importId: string) => Promise<void>;
  };
}

const LineageContext = createContext<LineageContextType | undefined>(undefined);

// Initial state
const initialState: State = {
  lineages: [],
  currentLineageId: null,
  currentLineage: null,
  ui: {
    loading: false,
    error: null,
  },
};

// Provider
export function LineageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lineageReducer, initialState);

  useEffect(() => {
    fetchLineages();
  }, []);

  const fetchAllLineages = async () => {
    dispatch({ type: 'LOADING_START' });
    fetchLineages()
      .then((data) => dispatch({ type: 'SET_LINEAGES', payload: data }))
      .catch((err) => dispatch({ type: 'LOADING_ERROR', error: err.message }));
  }

  const selectLineage = async (importId: string) => {
    dispatch({ type: 'SET_CURRENT_LINEAGE_ID', payload: importId });
    // dispatch({ type: 'LOADING_START' });
    // try {
    //   const lineageResponse = await fetchLineage(importId);
    //   dispatch({ type: 'SET_CURRENT_LINEAGE', payload: lineageResponse });
    // } catch (err: any) {
    //   dispatch({ type: 'LOADING_ERROR', error: err.message });
    // }
  };

  return (
    <LineageContext.Provider value={{ state, actions: { fetchLineages: fetchAllLineages, selectLineage } }}>
      {children}
    </LineageContext.Provider>
  );
}

export default LineageContext;
