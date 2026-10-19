import { useEffect, useReducer } from 'react';
export type Phase = 'INTRO' | 'INTRO_LETTER_OPEN' | 'TREE' | 'WISH_OPEN' | 'WISH_CLOSING' | 'ALL_COLLECTED' | 'CHOPPING' | 'FINALE';
export interface State {
    phase: Phase;
    collected: number[];
    active: number | null;
    chops: number;
}
export type Action = {
    type: 'OPEN_INTRO' | 'ENTER' | 'CLOSE' | 'LANDED' | 'CHOP' | 'FINISH' | 'RESTART';
} | {
    type: 'OPEN';
    id: number;
};
export const KEY = '12ct3-blooming-v1';
export function initialState(): State { try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Array.isArray(saved.collected)) {
        const collected = [...new Set<number>(saved.collected.filter((id: unknown) => Number.isInteger(id) && Number(id) >= 1 && Number(id) <= 20))];
        return { phase: saved.finished && collected.length === 20 ? 'FINALE' : collected.length === 20 ? 'ALL_COLLECTED' : 'TREE', collected, active: null, chops: 0 };
    }
}
catch { /* Private browsing still works in memory. */ } return { phase: 'INTRO', collected: [], active: null, chops: 0 }; }
export function reducer(s: State, a: Action): State { switch (a.type) {
    case 'OPEN_INTRO': return s.phase === 'INTRO' ? { ...s, phase: 'INTRO_LETTER_OPEN' } : s;
    case 'ENTER': return s.phase === 'INTRO_LETTER_OPEN' ? { ...s, phase: 'TREE' } : s;
    case 'OPEN': return s.phase === 'TREE' && Number.isInteger(a.id) && a.id >= 1 && a.id <= 20 && !s.collected.includes(a.id) ? { ...s, phase: 'WISH_OPEN', active: a.id } : s;
    case 'CLOSE': return s.phase === 'WISH_OPEN' ? { ...s, phase: 'WISH_CLOSING' } : s;
    case 'LANDED': {
        if (s.phase !== 'WISH_CLOSING' || s.active === null)
            return s;
        const collected = [...s.collected, s.active];
        return { ...s, collected, active: null, phase: collected.length === 20 ? 'ALL_COLLECTED' : 'TREE' };
    }
    case 'CHOP': return (s.phase === 'ALL_COLLECTED' || s.phase === 'CHOPPING') && s.chops < 3 ? { ...s, phase: 'CHOPPING', chops: s.chops + 1 } : s;
    case 'FINISH': return s.phase === 'CHOPPING' && s.chops === 3 ? { ...s, phase: 'FINALE' } : s;
    case 'RESTART': return { phase: 'INTRO', collected: [], active: null, chops: 0 };
} }
export function useWishProgress() { const [state, dispatch] = useReducer(reducer, undefined, initialState); useEffect(() => { if (state.phase === 'INTRO')
    return; try {
    localStorage.setItem(KEY, JSON.stringify({ collected: state.collected, finished: state.phase === 'FINALE' }));
}
catch { /* Storage unavailable. */ } }, [state.collected, state.phase]); return { state, dispatch }; }
