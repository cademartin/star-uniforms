import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserCredentials {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserCredentialsStore {
  users: UserCredentials[];
  currentUser: UserCredentials | null;
  isEditing: boolean;
  addUser: (user: Omit<UserCredentials, 'id'>) => void;
  updateUser: (id: string, user: Partial<UserCredentials>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: UserCredentials | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useUserCredentialsStore = create<UserCredentialsStore>()(
  persist(
    (set) => ({
      users: [],
      currentUser: null,
      isEditing: false,
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, { ...user, id: Date.now().toString() }],
        })),
      updateUser: (id, updatedUser) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updatedUser } : user
          ),
          currentUser:
            state.currentUser?.id === id
              ? { ...state.currentUser, ...updatedUser }
              : state.currentUser,
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          currentUser:
            state.currentUser?.id === id ? null : state.currentUser,
        })),
      setCurrentUser: (user) => set({ currentUser: user }),
      setIsEditing: (isEditing) => set({ isEditing }),
    }),
    {
      name: import.meta.env.VITE_STORAGE_KEY,
    }
  )
); 