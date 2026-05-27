import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  isFirebaseConfigured, 
  OperationType, 
  handleFirestoreError 
} from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { Book, Chapter, UserProfile, DailyLog, ReferenceItem, BookStatus, ChapterStatus, ChapterPriority } from '../types';

interface AppContextProps {
  currentUser: any;
  userProfile: UserProfile | null;
  books: Book[];
  chapters: Chapter[];
  loading: boolean;
  isFirebaseActive: boolean;
  syncStatus: 'synced' | 'saving' | 'offline' | 'error';
  // Auth Functions
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logInAsDrLeul: (useOfflineBypass?: boolean) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // Book CRUD
  createBook: (bookData: Omit<Book, 'id' | 'userId' | 'progress' | 'createdAt'>) => Promise<string>;
  editBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  // Chapter CRUD
  createChapter: (chapterData: Omit<Chapter, 'id' | 'userId' | 'progress' | 'wordCount' | 'pageCount' | 'references' | 'order' | 'updatedAt'> & { blocks: number }) => Promise<string>;
  editChapter: (chapterId: string, updates: Partial<Chapter>) => Promise<void>;
  removeChapter: (chapterId: string) => Promise<void>;
  reorderChapters: (bookId: string, orderedChapters: Chapter[]) => Promise<void>;
  // Reference management
  addReference: (chapterId: string, reference: Omit<ReferenceItem, 'id' | 'createdAt'>) => Promise<void>;
  removeReference: (chapterId: string, referenceId: string) => Promise<void>;
  // Utilities & AutoSave
  autoSaveNotes: (chapterId: string, notes: string) => Promise<void>;
  triggerMilestoneCheck: (type: 'wordCount' | 'streak' | 'bookCount' | 'chapterCount', value: number) => void;
  importWorkspaceData: (backupData: any) => Promise<void>;
  // Stats & Utilities
  writingStreak: number;
  totalWords: number;
  totalBooksCount: number;
  totalChaptersCount: number;
  completionRate: number; // overall percentage calculated from weighted progress blocks
  recentActivity: Array<{ id: string; type: string; details: string; date: string }>;
  unlockedBadgeIds: string[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// System Badges List
export const ACHIEVEMENT_BADGES = [
  { id: 'first_book', title: 'World Builder', description: 'Create your first book outline', icon: 'BookOpen', threshold: 1, type: 'bookCount' },
  { id: 'first_chapter', title: 'First Chapter', description: 'Create your first book chapter', icon: 'Feather', threshold: 1, type: 'chapterCount' },
  { id: 'novelist_outline', title: 'Architect of Worlds', description: 'Outline at least 10 chapters', icon: 'Milestone', threshold: 10, type: 'chapterCount' },
  { id: 'wordsmith_1k', title: 'Initiate Of Words', description: 'Write 1,000 words in StoryBlocks', icon: 'Scroll', threshold: 1000, type: 'wordCount' },
  { id: 'wordsmith_10k', title: 'Master Novelist', description: 'Write 10,000 words in StoryBlocks', icon: 'Award', threshold: 10000, type: 'wordCount' },
  { id: 'streak_3', title: 'Sustained Quill', description: 'Maintain a 3-day active writing streak', icon: 'Zap', threshold: 3, type: 'streak' },
  { id: 'streak_7', title: 'Relentless Muse', description: 'Maintain a 7-day active writing streak', icon: 'Flame', threshold: 7, type: 'streak' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('synced');
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; type: string; details: string; date: string }>>([]);

  const isFirebaseActive = isFirebaseConfigured && db && auth;

  // Track state changes to compute live calculations
  const [totalWords, setTotalWords] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  // Initial user loads
  useEffect(() => {
    // Local Storage Sandboxed Engine Helper
    const loadLocalStorageData = () => {
      const localUser = localStorage.getItem('storyblocks_current_user');
      if (localUser) {
        const userObj = JSON.parse(localUser);
        setCurrentUser(userObj);
        
        const storedProfile = localStorage.getItem(`storyblocks_profile_${userObj.uid}`);
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        } else {
          const defaultProf: UserProfile = {
            id: userObj.uid,
            displayName: userObj.displayName || 'Dr. Leul',
            email: userObj.email || 'dr.leul@storyblocks.org',
            writingStreak: 0,
            lastWriteDate: '',
            badges: [],
            dailyLogs: {}
          };
          localStorage.setItem(`storyblocks_profile_${userObj.uid}`, JSON.stringify(defaultProf));
          setUserProfile(defaultProf);
        }

        // Load Books & Chapters
        const storedBooks = localStorage.getItem(`storyblocks_books_${userObj.uid}`);
        setBooks(storedBooks ? JSON.parse(storedBooks) : []);

        const storedChapters = localStorage.getItem(`storyblocks_chapters_${userObj.uid}`);
        setChapters(storedChapters ? JSON.parse(storedChapters) : []);
        setSyncStatus('offline');
        setLoading(false);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setBooks([]);
        setChapters([]);
        setSyncStatus('offline');
        setLoading(false);
      }
    };

    if (isFirebaseActive) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          setSyncStatus('synced');
          // Subscribe to User Profile in Firestore
          const profileRef = doc(db, 'users', user.uid);
          const unsubProfile = onSnapshot(profileRef, (snap) => {
            if (snap.exists()) {
              setUserProfile(snap.data() as UserProfile);
            } else {
              // Create default profile
              const newProfile: UserProfile = {
                id: user.uid,
                displayName: user.displayName || 'Dr. Leul',
                email: user.email || '',
                writingStreak: 0,
                lastWriteDate: '',
                badges: [],
                dailyLogs: {}
              };
              setDoc(profileRef, newProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
              setUserProfile(newProfile);
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          });

          // Subscribe to Books
          const qBooks = query(collection(db, 'books'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const unsubBooks = onSnapshot(qBooks, (snap) => {
            const booksList: Book[] = [];
            snap.forEach((d) => booksList.push(d.data() as Book));
            setBooks(booksList);
          }, (err) => {
             handleFirestoreError(err, OperationType.LIST, 'books');
          });

          // Subscribe to Chapters
          const qChapters = query(collection(db, 'chapters'), where('userId', '==', user.uid));
          const unsubChapters = onSnapshot(qChapters, (snap) => {
            const chaptersList: Chapter[] = [];
            snap.forEach((d) => chaptersList.push(d.data() as Chapter));
            // Sort chapters by order ascending
            chaptersList.sort((a, b) => a.order - b.order);
            setChapters(chaptersList);
          }, (err) => {
             handleFirestoreError(err, OperationType.LIST, 'chapters');
          });

          return () => {
            unsubProfile();
            unsubBooks();
            unsubChapters();
          };
        } else {
          // Firebase reports NO active user session. Let's see if Dr. Leul offline sandbox is active.
          const localUser = localStorage.getItem('storyblocks_current_user');
          if (localUser) {
            const userObj = JSON.parse(localUser);
            if (userObj.uid === 'dr_leul_author_workspace') {
              loadLocalStorageData();
              return;
            }
          }

          setUserProfile(null);
          setBooks([]);
          setChapters([]);
          setCurrentUser(null);
          setLoading(false);
        }
      });
      return unsubscribe;
    } else {
      loadLocalStorageData();
      
      // Listen to storage sync events
      window.addEventListener('storage', loadLocalStorageData);
      return () => window.removeEventListener('storage', loadLocalStorageData);
    }
  }, [isFirebaseActive, currentUser?.uid]);

  // Set loading to false once data is loaded (firestore handles asynchronously)
  useEffect(() => {
    if (currentUser && (books.length >= 0 || chapters.length >= 0)) {
      setLoading(false);
    } else if (!currentUser) {
      setLoading(false);
    }
  }, [currentUser, books, chapters]);

  // Calculations for KPI parameters
  useEffect(() => {
    // Total Word Count
    const totalWordsCount = chapters.reduce((acc, chap) => acc + (chap.wordCount || 0), 0);
    setTotalWords(totalWordsCount);

    // Completion Rate based on Weighted progress blocks
    // Overall completion = Sum(chapter.progress * chapter.blocks) / Sum(chapter.blocks * 100)
    const totalWeight = chapters.reduce((acc, chap) => acc + chap.blocks, 0);
    if (totalWeight > 0) {
      const weightedProgressSum = chapters.reduce((acc, chap) => acc + ((chap.progress || 0) * chap.blocks), 0);
      const totalPossibleProgress = totalWeight * 100;
      setCompletionRate(Math.round((weightedProgressSum / totalPossibleProgress) * 100));
    } else {
      setCompletionRate(0);
    }

    // Trigger milestone checks on change
    if (currentUser) {
      triggerMilestoneCheck('wordCount', totalWords);
      triggerMilestoneCheck('chapterCount', chapters.length);
      triggerMilestoneCheck('bookCount', books.length);
      if (userProfile?.writingStreak) {
        triggerMilestoneCheck('streak', userProfile.writingStreak);
      }
    }
  }, [chapters, books, userProfile?.writingStreak, currentUser]);

  // Local helper to track activity logs
  const addActivityLog = (type: string, details: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      details,
      date: new Date().toISOString()
    };
    setRecentActivity(prev => [newLog, ...prev.slice(0, 9)]);
  };

  // Auth operations
  const signUp = async (email: string, pass: string, name: string) => {
    setLoading(true);
    if (isFirebaseActive) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        // Create full user profile
        const newProfile: UserProfile = {
          id: cred.user.uid,
          displayName: name,
          email: email,
          writingStreak: 0,
          lastWriteDate: '',
          badges: [],
          dailyLogs: {}
        };
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        setUserProfile(newProfile);
        addActivityLog('Auth', `Joined StoryBlocks as ${name}`);
      } catch (err: any) {
        setSyncStatus('error');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Offline implementation
      const uid = 'local_user_' + Math.random().toString(36).substr(2, 9);
      const fakeUser = { uid, email, displayName: name };
      localStorage.setItem('storyblocks_current_user', JSON.stringify(fakeUser));
      
      const newProfile: UserProfile = {
        id: uid,
        displayName: name,
        email: email,
        writingStreak: 0,
        lastWriteDate: '',
        badges: [],
        dailyLogs: {}
      };
      localStorage.setItem(`storyblocks_profile_${uid}`, JSON.stringify(newProfile));
      localStorage.setItem(`storyblocks_books_${uid}`, JSON.stringify([]));
      localStorage.setItem(`storyblocks_chapters_${uid}`, JSON.stringify([]));
      
      setCurrentUser(fakeUser);
      setUserProfile(newProfile);
      setBooks([]);
      setChapters([]);
      addActivityLog('Auth', `Welcome to local workbench, ${name}!`);
      setLoading(false);
    }
  };

  const logIn = async (email: string, pass: string) => {
    setLoading(true);
    if (isFirebaseActive) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        addActivityLog('Auth', `Author logged in successfully`);
      } catch (err: any) {
        setSyncStatus('error');
         throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate login offline
      const localUser = localStorage.getItem('storyblocks_current_user');
      if (localUser) {
        const u = JSON.parse(localUser);
        if (u.email === email) {
          setCurrentUser(u);
          // Load existing storage
          const storedProfile = localStorage.getItem(`storyblocks_profile_${u.uid}`);
          setUserProfile(storedProfile ? JSON.parse(storedProfile) : null);
          const storedBooks = localStorage.getItem(`storyblocks_books_${u.uid}`);
          setBooks(storedBooks ? JSON.parse(storedBooks) : []);
          const storedChapters = localStorage.getItem(`storyblocks_chapters_${u.uid}`);
          setChapters(storedChapters ? JSON.parse(storedChapters) : []);
          addActivityLog('Auth', `Logged back into local workspace`);
        } else {
          // If different, create a simulated login state
          const uid = 'local_user_active';
          const newUser = { uid, email, displayName: email.split('@')[0] };
          localStorage.setItem('storyblocks_current_user', JSON.stringify(newUser));
          setCurrentUser(newUser);
        }
      } else {
        // Create standard offline sandbox user
        const uid = 'local_author';
        const u = { uid, email, displayName: 'SaaS Author' };
        localStorage.setItem('storyblocks_current_user', JSON.stringify(u));
        setCurrentUser(u);
      }
      setLoading(false);
    }
  };

  const logInWithGoogle = async () => {
    setLoading(true);
    if (isFirebaseActive) {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        addActivityLog('Auth', `Google authentication successful`);
      } catch (err: any) {
        setSyncStatus('error');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate Google OAuth
      const email = 'calebdani71@gmail.com';
      const name = 'Caleb Dani';
      await signUp(email, 'google-simulated', name);
    }
  };

  const logInAsDrLeul = async (useOfflineBypass = false) => {
    setLoading(true);
    const email = 'dr.leul@storyblocks.org';
    const password = 'drleulactive';
    const name = 'Dr. Leul';
    const uid = 'dr_leul_author_workspace';

    if (isFirebaseActive && !useOfflineBypass) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        addActivityLog('Auth', `Welcome back, Dr. Leul (Cloud Session Activated)`);
      } catch (err: any) {
        console.error("Cloud login failed for Dr. Leul, trying to register...", err);
        if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
          console.error(
            "[Firebase Config Error] Email/Password Sign-In Provider is not enabled in your Firebase Console.\n" +
            "Please enable it under: Build -> Authentication -> Sign-in method -> Email/Password."
          );
          activateLocalDrLeul();
        } else if (err.code === 'auth/user-not-found' || err.message?.includes('user-not-found') || err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Create profile
            const newProfile: UserProfile = {
              id: auth.currentUser?.uid || uid,
              displayName: name,
              email: email,
              writingStreak: 0,
              lastWriteDate: '',
              badges: [],
              dailyLogs: {}
            };
            await setDoc(doc(db, 'users', newProfile.id), newProfile);
            setUserProfile(newProfile);
            addActivityLog('Auth', `Welcome, Dr. Leul (Cloud Workspace Provisioned)`);
          } catch (regErr: any) {
            console.error("Failed to register Dr. Leul on cloud, activating local workspace fallback", regErr);
            if (regErr.code === 'auth/operation-not-allowed' || regErr.message?.includes('operation-not-allowed')) {
              console.error(
                "[Firebase Config Error] Email/Password Sign-In Provider is not enabled in your Firebase Console.\n" +
                "Please enable it under: Build -> Authentication -> Sign-in method -> Email/Password."
              );
            }
            activateLocalDrLeul();
          }
        } else {
          // Trigger local fallback for authorized domain error or other blockers
          console.warn("Domain mismatch or cloud mismatch. Activating secure Local Storage Sandbox for Dr. Leul.");
          activateLocalDrLeul();
        }
      } finally {
        setLoading(false);
      }
    } else {
      activateLocalDrLeul();
    }

    function activateLocalDrLeul() {
      const fakeUser = { uid, email, displayName: name };
      localStorage.setItem('storyblocks_current_user', JSON.stringify(fakeUser));
      
      const storedProfile = localStorage.getItem(`storyblocks_profile_${uid}`);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        const defaultProf: UserProfile = {
          id: uid,
          displayName: name,
          email: email,
          writingStreak: 0,
          lastWriteDate: '',
          badges: [],
          dailyLogs: {}
        };
        localStorage.setItem(`storyblocks_profile_${uid}`, JSON.stringify(defaultProf));
        setUserProfile(defaultProf);
      }

      // Load Books & Chapters under Dr. Leul's UID
      const storedBooks = localStorage.getItem(`storyblocks_books_${uid}`);
      setBooks(storedBooks ? JSON.parse(storedBooks) : []);

      const storedChapters = localStorage.getItem(`storyblocks_chapters_${uid}`);
      setChapters(storedChapters ? JSON.parse(storedChapters) : []);

      setCurrentUser(fakeUser);
      setSyncStatus('offline');
      addActivityLog('Auth', `Welcome back Dr. Leul (Offline Vault Activated)`);
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    localStorage.removeItem('storyblocks_current_user');
    if (isFirebaseActive) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase logout error:", err);
      }
    }
    setCurrentUser(null);
    setUserProfile(null);
    setBooks([]);
    setChapters([]);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseActive) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Simulated reset password email sent to ${email}`);
    }
  };

  // Books operations
  const createBook = async (bookData: Omit<Book, 'id' | 'userId' | 'progress' | 'createdAt'>) => {
    if (!currentUser) throw new Error("Requires authenticated author context.");
    const bookId = 'book_' + Math.random().toString(36).substr(2, 9);
    const fullBook: Book = {
      ...bookData,
      id: bookId,
      userId: currentUser.uid,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        await setDoc(doc(db, 'books', bookId), fullBook);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.CREATE, `books/${bookId}`);
      }
    } else {
      const updatedBooks = [...books, fullBook];
      setBooks(updatedBooks);
      localStorage.setItem(`storyblocks_books_${currentUser.uid}`, JSON.stringify(updatedBooks));
    }
    addActivityLog('Outline', `Created book draft outline "${bookData.title}"`);
    return bookId;
  };

  const editBook = async (bookId: string, updates: Partial<Book>) => {
    if (!currentUser) return;
    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        await updateDoc(doc(db, 'books', bookId), updates);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.UPDATE, `books/${bookId}`);
      }
    } else {
      const updatedBooks = books.map(b => b.id === bookId ? { ...b, ...updates } : b);
      setBooks(updatedBooks);
      localStorage.setItem(`storyblocks_books_${currentUser.uid}`, JSON.stringify(updatedBooks));
    }
    
    if (updates.title) {
      addActivityLog('Outline', `Updated book details for "${updates.title}"`);
    }
  };

  const removeBook = async (bookId: string) => {
    if (!currentUser) return;
    const targetBook = books.find(b => b.id === bookId);
    if (!targetBook) return;

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        await deleteDoc(doc(db, 'books', bookId));
        // Cascade delete chapters associated
        const bookChapters = chapters.filter(c => c.bookId === bookId);
        for (const chap of bookChapters) {
          await deleteDoc(doc(db, 'chapters', chap.id));
        }
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.DELETE, `books/${bookId}`);
      }
    } else {
      const updatedBooks = books.filter(b => b.id !== bookId);
      setBooks(updatedBooks);
      localStorage.setItem(`storyblocks_books_${currentUser.uid}`, JSON.stringify(updatedBooks));

      const updatedChapters = chapters.filter(c => c.bookId !== bookId);
      setChapters(updatedChapters);
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(updatedChapters));
    }
    addActivityLog('Outline', `Deleted book "${targetBook.title}" and its chapters`);
  };

  // Chapters Collection Operations
  const createChapter = async (chapterData: Omit<Chapter, 'id' | 'userId' | 'progress' | 'wordCount' | 'pageCount' | 'references' | 'order' | 'updatedAt'> & { blocks: number }) => {
    if (!currentUser) throw new Error("Authentication required.");
    const chapterId = 'chapter_' + Math.random().toString(36).substr(2, 9);
    
    // Calculate current highest order value for this book's chapters
    const bookChaps = chapters.filter(c => c.bookId === chapterData.bookId);
    const order = bookChaps.length > 0 ? Math.max(...bookChaps.map(c => c.order)) + 1 : 0;

    const fullChapter: Chapter = {
      ...chapterData,
      id: chapterId,
      userId: currentUser.uid,
      progress: 0,
      wordCount: 0,
      pageCount: 0,
      references: [],
      order,
      status: 'To Do',
      priority: chapterData.priority || 'Medium',
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        await setDoc(doc(db, 'chapters', chapterId), fullChapter);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.CREATE, `chapters/${chapterId}`);
      }
    } else {
      const updatedChapters = [...chapters, fullChapter];
      setChapters(updatedChapters);
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(updatedChapters));
    }

    addActivityLog('Drafting', `Added Chapter "${chapterData.title}" [Weight: ${chapterData.blocks} Blocks]`);
    return chapterId;
  };

  const editChapter = async (chapterId: string, updates: Partial<Chapter>) => {
    if (!currentUser) return;
    const existingChap = chapters.find(c => c.id === chapterId);
    if (!existingChap) return;

    const fullUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        await updateDoc(doc(db, 'chapters', chapterId), fullUpdates);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.UPDATE, `chapters/${chapterId}`);
      }
    } else {
      const updatedChapters = chapters.map(c => c.id === chapterId ? { ...c, ...fullUpdates } : c);
      setChapters(updatedChapters);
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(updatedChapters));
    }
  };

  const removeChapter = async (chapterId: string) => {
    if (!currentUser) return;
    const targetChap = chapters.find(c => c.id === chapterId);
    if (!targetChap) return;

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        await deleteDoc(doc(db, 'chapters', chapterId));
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.DELETE, `chapters/${chapterId}`);
      }
    } else {
      const updatedChapters = chapters.filter(c => c.id !== chapterId);
      setChapters(updatedChapters);
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(updatedChapters));
    }
    addActivityLog('Drafting', `Removed chapter outline "${targetChap.title}"`);
  };

  const reorderChapters = async (bookId: string, orderedChapters: Chapter[]) => {
    if (!currentUser) return;
    
    // Assign new indices
    const updatedChaps = chapters.map(chap => {
      if (chap.bookId === bookId) {
        const orderIndex = orderedChapters.findIndex(oc => oc.id === chap.id);
        if (orderIndex !== -1) {
          return { ...chap, order: orderIndex, updatedAt: new Date().toISOString() };
        }
      }
      return chap;
    });

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        for (const chap of updatedChaps.filter(c => c.bookId === bookId)) {
          await updateDoc(doc(db, 'chapters', chap.id), { order: chap.order, updatedAt: chap.updatedAt });
        }
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.UPDATE, `chapters/reorder`);
      }
    } else {
      setChapters(updatedChaps);
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(updatedChaps));
    }
    
    addActivityLog('Outline', `Re-ordered workspace skeleton map`);
  };

  // References Section Logic
  const addReference = async (chapterId: string, reference: Omit<ReferenceItem, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const targetChapter = chapters.find(c => c.id === chapterId);
    if (!targetChapter) return;

    const newRef: ReferenceItem = {
      ...reference,
      id: 'ref_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    const updatedRefs = [...(targetChapter.references || []), newRef];
    await editChapter(chapterId, { references: updatedRefs });
    addActivityLog('Research', `Attached resource doc "${reference.name}" to chapter "${targetChapter.title}"`);
  };

  const removeReference = async (chapterId: string, referenceId: string) => {
    if (!currentUser) return;
    const targetChapter = chapters.find(c => c.id === chapterId);
    if (!targetChapter) return;

    const updatedRefs = (targetChapter.references || []).filter(r => r.id !== referenceId);
    await editChapter(chapterId, { references: updatedRefs });
    addActivityLog('Research', `Removed attached outline resource`);
  };

  // Real-time Autosave & Word Calculation
  const autoSaveNotes = async (chapterId: string, notes: string) => {
    if (!currentUser) return;
    setSyncStatus('saving');
    
    // Words count (ignoring formatting spaces)
    const cleanText = notes.trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
    // Estimated standard page count (usually 250 - 300 words a page)
    const pageCount = Math.max(1, Math.ceil(wordCount / 250));

    // Calculate progression based on wordcount vs targets, or let authors scale it.
    // For automatic progression, if there's no progress manual set, let it raise with words, or just change notes.
    const updates: Partial<Chapter> = {
      notes,
      wordCount,
      pageCount,
      updatedAt: new Date().toISOString()
    };

    // Keep daily logs updated for streak calculations
    const todayStr = new Date().toISOString().split('T')[0];
    const prevWords = chapters.find(c => c.id === chapterId)?.wordCount || 0;
    const difference = wordCount - prevWords;

    if (isFirebaseActive) {
      try {
        await updateDoc(doc(db, 'chapters', chapterId), updates);
        
        // Update writing streak logging
        if (difference !== 0 && userProfile) {
          const profileRef = doc(db, 'users', currentUser.uid);
          const logs = { ...userProfile.dailyLogs };
          const existingDayLog = logs[todayStr] || { date: todayStr, wordsWritten: 0, chaptersCompleted: 0 };
          
          existingDayLog.wordsWritten += difference;
          logs[todayStr] = existingDayLog;

          // Streak recalculation check
          let streak = userProfile.writingStreak || 0;
          if (userProfile.lastWriteDate !== todayStr) {
            // New active write day
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (userProfile.lastWriteDate === yesterdayStr) {
              streak += 1;
            } else if (userProfile.lastWriteDate === '') {
              streak = 1;
            } else {
              streak = 1; // broken streak restart
            }
          }

          const badgeUpdates: string[] = [...userProfile.badges];
          await updateDoc(profileRef, {
            dailyLogs: logs,
            lastWriteDate: todayStr,
            writingStreak: streak
          });
        }
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.UPDATE, `chapters/${chapterId}`);
      }
    } else {
      // Offline local logging
      const updatedChapters = chapters.map(c => c.id === chapterId ? { ...c, ...updates } : c);
      setChapters(updatedChapters);
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(updatedChapters));

      if (difference !== 0 && userProfile) {
        const logs = { ...userProfile.dailyLogs };
        const existingDayLog = logs[todayStr] || { date: todayStr, wordsWritten: 0, chaptersCompleted: 0 };
        existingDayLog.wordsWritten += difference;
        logs[todayStr] = existingDayLog;

        let streak = userProfile.writingStreak || 0;
        if (userProfile.lastWriteDate !== todayStr) {
          const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (userProfile.lastWriteDate === yesterdayStr) {
            streak += 1;
          } else {
            streak = 1;
          }
        }

        const newProf = {
          ...userProfile,
          dailyLogs: logs,
          lastWriteDate: todayStr,
          writingStreak: streak
        };
        setUserProfile(newProf);
        localStorage.setItem(`storyblocks_profile_${currentUser.uid}`, JSON.stringify(newProf));
      }
      setSyncStatus('offline');
    }
  };

  // Medal Badge Milestone checks
  const triggerMilestoneCheck = (type: 'wordCount' | 'streak' | 'bookCount' | 'chapterCount', value: number) => {
    if (!userProfile) return;
    
    const possibleBadges = ACHIEVEMENT_BADGES.filter(b => b.type === type && value >= b.threshold);
    const lockedAlready = possibleBadges.filter(b => !userProfile.badges.includes(b.id));

    if (lockedAlready.length > 0) {
      const unlockedIds = lockedAlready.map(b => b.id);
      const newBadgesList = [...userProfile.badges, ...unlockedIds];
      
      const updateData = { badges: newBadgesList };

      if (isFirebaseActive) {
        updateDoc(doc(db, 'users', currentUser.uid), updateData).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
        });
      } else {
        const newProf = { ...userProfile, badges: newBadgesList };
        setUserProfile(newProf);
        localStorage.setItem(`storyblocks_profile_${currentUser.uid}`, JSON.stringify(newProf));
      }

      lockedAlready.forEach(b => {
        addActivityLog('Achievement', `🏅 Unlocked Trophy: "${b.title}"! (${b.description})`);
      });
    }
  };

  const importWorkspaceData = async (backupData: any) => {
    if (!currentUser) throw new Error("A valid active author session is required.");
    
    if (!backupData || typeof backupData !== 'object') {
      throw new Error("Invalid backup metadata context.");
    }
    
    const importedBooks = Array.isArray(backupData.books) ? backupData.books : [];
    const importedChapters = Array.isArray(backupData.chapters) ? backupData.chapters : [];
    
    const sanitizedBooks: Book[] = importedBooks.map((b: any) => ({
      id: b.id || 'book_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.uid,
      title: b.title || 'Untitled Outline',
      genre: b.genre || 'Drama',
      description: b.description || '',
      coverImage: b.coverImage || '',
      plannedChapters: b.plannedChapters || 12,
      writingGoal: b.writingGoal || 50000,
      status: b.status || 'Draft',
      progress: b.progress || 0,
      createdAt: b.createdAt || new Date().toISOString()
    }));

    const sanitizedChapters: Chapter[] = importedChapters.map((c: any) => ({
      id: c.id || 'chapter_' + Math.random().toString(36).substr(2, 9),
      bookId: c.bookId || '',
      userId: currentUser.uid,
      title: c.title || 'Untitled Chapter Outline',
      summary: c.summary || '',
      notes: c.notes || '',
      progress: c.progress || 0,
      blocks: c.blocks || 2,
      pageCount: c.pageCount || 0,
      wordCount: c.wordCount || 0,
      status: c.status || 'To Do',
      priority: c.priority || 'Medium',
      references: Array.isArray(c.references) ? c.references : [],
      order: typeof c.order === 'number' ? c.order : 0,
      updatedAt: c.updatedAt || new Date().toISOString()
    }));

    if (isFirebaseActive) {
      setSyncStatus('saving');
      try {
        for (const book of sanitizedBooks) {
          await setDoc(doc(db, 'books', book.id), book);
        }
        for (const chap of sanitizedChapters) {
          await setDoc(doc(db, 'chapters', chap.id), chap);
        }
        
        if (backupData.profile && typeof backupData.profile === 'object') {
          const profileRef = doc(db, 'users', currentUser.uid);
          const currentProfProps = {
            id: currentUser.uid,
            displayName: backupData.profile.displayName || userProfile?.displayName || 'Author',
            email: backupData.profile.email || userProfile?.email || currentUser.email || '',
            writingStreak: backupData.profile.writingStreak || userProfile?.writingStreak || 0,
            lastWriteDate: backupData.profile.lastWriteDate || userProfile?.lastWriteDate || '',
            badges: Array.isArray(backupData.profile.badges) ? backupData.profile.badges : userProfile?.badges || [],
            dailyLogs: backupData.profile.dailyLogs || userProfile?.dailyLogs || {}
          };
          await setDoc(profileRef, currentProfProps);
          setUserProfile(currentProfProps);
        }
        
        setBooks(sanitizedBooks);
        setChapters(sanitizedChapters);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        throw new Error("Cloud firestore sync failed: " + (err as any).message);
      }
    } else {
      localStorage.setItem(`storyblocks_books_${currentUser.uid}`, JSON.stringify(sanitizedBooks));
      localStorage.setItem(`storyblocks_chapters_${currentUser.uid}`, JSON.stringify(sanitizedChapters));
      
      if (backupData.profile && typeof backupData.profile === 'object' && userProfile) {
        const mergedProfile = {
          ...userProfile,
          displayName: backupData.profile.displayName || userProfile.displayName,
          writingStreak: backupData.profile.writingStreak || userProfile.writingStreak,
          lastWriteDate: backupData.profile.lastWriteDate || userProfile.lastWriteDate,
          badges: Array.isArray(backupData.profile.badges) ? backupData.profile.badges : userProfile.badges,
          dailyLogs: backupData.profile.dailyLogs || userProfile.dailyLogs
        };
        localStorage.setItem(`storyblocks_profile_${currentUser.uid}`, JSON.stringify(mergedProfile));
        setUserProfile(mergedProfile);
      }
      
      setBooks(sanitizedBooks);
      setChapters(sanitizedChapters);
      setSyncStatus('offline');
    }
    
    addActivityLog('Outline', `Restored database backup with ${sanitizedBooks.length} books and ${sanitizedChapters.length} chapters.`);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      userProfile,
      books,
      chapters,
      loading,
      isFirebaseActive,
      syncStatus,
      // Auth
      signUp,
      logIn,
      logInWithGoogle,
      logInAsDrLeul,
      logOut,
      resetPassword,
      // Book
      createBook,
      editBook,
      removeBook,
      // Chapter
      createChapter,
      editChapter,
      removeChapter,
      reorderChapters,
      // References
      addReference,
      removeReference,
      // Autosave/Logs
      autoSaveNotes,
      triggerMilestoneCheck,
      importWorkspaceData,
      // Computed Live Stats
      writingStreak: userProfile?.writingStreak || 0,
      totalWords,
      totalBooksCount: books.length,
      totalChaptersCount: chapters.length,
      completionRate,
      recentActivity,
      unlockedBadgeIds: userProfile?.badges || []
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
};
