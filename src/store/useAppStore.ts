import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Page {
  id: string;
  name: string;
  token: string;
}

export interface Message {
  id: string;
  text: string;
  from: {
    id: string;
    name: string;
    email?: string;
  };
  to: {
    data: Array<{
      id: string;
      name: string;
      email?: string;
    }>;
  };
  created_time: string;
}

export interface Conversation {
  id: string;
  page_id: string;
  page_name: string;
  messages: {
    data: Message[];
  };
  participants: {
    data: Array<{
      id: string;
      name: string;
      email?: string;
    }>;
  };
  updated_time: string;
}

interface AppState {
  pages: Page[];
  activePageFilter: string;
  activeConversationId: string | null;
  conversations: Conversation[];
  isFetching: boolean;
  addPage: (page: Page) => void;
  removePage: (pageId: string) => void;
  setFilter: (filter: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setIsFetching: (status: boolean) => void;
  addOptimisticMessage: (conversationId: string, text: string, fromId: string, fromName: string, messageId: string) => void;
  removeOptimisticMessage: (conversationId: string, messageId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      pages: [],
      activePageFilter: 'ALL',
      activeConversationId: null,
      conversations: [],
      isFetching: false,
      addPage: (page) =>
        set((state) => ({
          pages: [...state.pages, page],
        })),
      removePage: (pageId) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== pageId),
          activePageFilter: state.activePageFilter === pageId ? 'ALL' : state.activePageFilter,
        })),
      setFilter: (filter) => set({ activePageFilter: filter, activeConversationId: null }),
      setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
      setConversations: (conversations: Conversation[]) => set({ conversations }),
      setIsFetching: (status) => set({ isFetching: status }),
      addOptimisticMessage: (conversationId, text, fromId, fromName, messageId) => 
        set((state) => {
          const now = new Date().toISOString();
          const newMsg: Message = {
            id: messageId,
            text,
            from: { id: fromId, name: fromName },
            to: { data: [] }, // Usually not perfectly populated on outbound, UI won't break
            created_time: now
          };

          return {
            conversations: state.conversations.map(conv => {
              if (conv.id !== conversationId) return conv;
              return {
                ...conv,
                updated_time: now,
                messages: {
                  ...conv.messages,
                  data: [...conv.messages.data, newMsg]
                }
              };
            })
          };
        }),
      removeOptimisticMessage: (conversationId, messageId) =>
        set((state) => ({
          conversations: state.conversations.map(conv => {
            if (conv.id !== conversationId) return conv;
            return {
              ...conv,
              messages: {
                ...conv.messages,
                data: conv.messages.data.filter(msg => msg.id !== messageId)
              }
            };
          })
        })),
    }),
    {
      name: 'unified-inbox-storage',
      // We explicitly persist pages, activePageFilter, maybe we don't persist conversations to keep it fresh
      partialize: (state) => ({ 
        pages: state.pages,
        activePageFilter: state.activePageFilter
      }),
    }
  )
);
