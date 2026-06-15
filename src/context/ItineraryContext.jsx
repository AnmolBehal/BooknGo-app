// ─── ItineraryContext (Universal Bag) ───
// A cross-vertical cart that aggregates items from Movies, Events, Sports, Dining, Stays.
// Each item is tagged with its vertical so the Itinerary page can group them.

import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ItineraryContext = createContext(null);

export const useItinerary = () => {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error('useItinerary must be used inside <ItineraryProvider>');
  return ctx;
};

// ── Item shape ──
// {
//   id:       string,        unique key (e.g., "movie-12345" or "event-678")
//   type:     'movie' | 'event' | 'sport' | 'dining' | 'stay',
//   title:    string,
//   subtitle: string,        e.g., showtime, date, restaurant name
//   image:    string,        poster/thumbnail URL
//   price:    number,
//   quantity: number,
//   meta:     object,        extra payload (seats, time slot, etc.)
// }

// ── Reducer ──
const ACTIONS = {
  ADD:            'ADD',
  REMOVE:         'REMOVE',
  UPDATE_QTY:     'UPDATE_QTY',
  CLEAR:          'CLEAR',
  CLEAR_VERTICAL: 'CLEAR_VERTICAL',
};

function itineraryReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        // Increase quantity
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      };
    }

    case ACTIONS.REMOVE:
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
      };

    case ACTIONS.UPDATE_QTY: {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== id) };
      }
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      };
    }

    case ACTIONS.CLEAR:
      return { ...state, items: [] };

    case ACTIONS.CLEAR_VERTICAL:
      return {
        ...state,
        items: state.items.filter((i) => i.type !== action.payload.vertical),
      };

    default:
      return state;
  }
}

const initialState = { items: [] };

export const ItineraryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(itineraryReducer, initialState);

  // ── Public API ──
  const addItem     = useCallback((item) => dispatch({ type: ACTIONS.ADD, payload: item }), []);
  const removeItem  = useCallback((id) =>   dispatch({ type: ACTIONS.REMOVE, payload: { id } }), []);
  const updateQty   = useCallback((id, quantity) => dispatch({ type: ACTIONS.UPDATE_QTY, payload: { id, quantity } }), []);
  const clearAll    = useCallback(() =>     dispatch({ type: ACTIONS.CLEAR }), []);
  const clearVertical = useCallback((vertical) => dispatch({ type: ACTIONS.CLEAR_VERTICAL, payload: { vertical } }), []);

  // ── Computed values ──
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Group items by vertical
  const groupedItems = state.items.reduce((groups, item) => {
    const key = item.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  const value = {
    items: state.items,
    groupedItems,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQty,
    clearAll,
    clearVertical,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
};

export default ItineraryContext;
