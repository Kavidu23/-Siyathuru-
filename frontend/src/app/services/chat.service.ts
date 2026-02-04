import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  senderId: string;
  senderName: string;
  recipientId?: string;
  text: string;
  timestamp?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private unreadSubject = new BehaviorSubject<boolean>(false);
  hasUnread$ = this.unreadSubject.asObservable();

  private lastSeen = new Map<string, number>();
  private latestThreads = new Map<
    string,
    { updatedAt: number; lastSenderId: string }
  >();
  private currentUserId: string | null = null;
  private unreadUnsubs: Array<() => void> = [];

  constructor(private firestore: Firestore) {}

  sendMessage(
    communityId: string,
    threadId: string,
    msg: ChatMessage,
  ): Promise<any>;
  sendMessage(communityId: string, msg: ChatMessage): Promise<any>;
  sendMessage(
    communityId: string,
    arg2: string | ChatMessage,
    arg3?: ChatMessage,
  ) {
    const threadId = typeof arg2 === 'string' ? arg2 : 'community';
    const msg = typeof arg2 === 'string' ? arg3! : arg2;

    const participantIds = [
      msg.senderId,
      msg.recipientId || null,
    ].filter(Boolean);

    const threadRef = doc(
      this.firestore,
      `communities/${communityId}/threads/${threadId}`,
    );

    setDoc(
      threadRef,
      {
        communityId,
        participantIds,
        lastMessage: msg.text,
        lastSenderId: msg.senderId,
        lastSenderName: msg.senderName,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    const ref = collection(
      this.firestore,
      `communities/${communityId}/threads/${threadId}/messages`,
    );

    return addDoc(ref, {
      ...msg,
      timestamp: serverTimestamp(),
    });
  }

  listenMessages(
    communityId: string,
    threadId: string,
    callback: (messages: ChatMessage[]) => void,
  ): () => void;
  listenMessages(
    communityId: string,
    callback: (messages: ChatMessage[]) => void,
  ): () => void;
  listenMessages(
    communityId: string,
    arg2: string | ((messages: ChatMessage[]) => void),
    arg3?: (messages: ChatMessage[]) => void,
  ) {
    const threadId = typeof arg2 === 'string' ? arg2 : 'community';
    const callback = typeof arg2 === 'string' ? arg3! : arg2;

    const ref = collection(
      this.firestore,
      `communities/${communityId}/threads/${threadId}/messages`,
    );

    const q = query(ref, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];

      snapshot.forEach((doc) => {
        messages.push(doc.data() as ChatMessage);
      });

      callback(messages);
    });

    return unsubscribe as () => void;
  }

  startUnreadListenerForCommunities(
    userId: string,
    communityIds: string[],
  ): () => void {
    this.currentUserId = userId;
    this.lastSeen.clear();
    this.latestThreads.clear();
    this.unreadSubject.next(false);

    this.unreadUnsubs.forEach((u) => u());
    this.unreadUnsubs = [];

    communityIds
      .filter(Boolean)
      .forEach((communityId) => {
        const ref = collection(
          this.firestore,
          `communities/${communityId}/threads`,
        );
        const q = query(ref, where('participantIds', 'array-contains', userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.forEach((docSnap) => {
            const data: any = docSnap.data();
            const threadId = docSnap.id;
            const updatedAt = data?.updatedAt?.toMillis
              ? data.updatedAt.toMillis()
              : 0;
            const lastSenderId = data?.lastSenderId || '';

            this.latestThreads.set(threadId, { updatedAt, lastSenderId });

            if (!this.lastSeen.has(threadId)) {
              if (lastSenderId === userId) {
                this.lastSeen.set(threadId, updatedAt);
              } else {
                this.lastSeen.set(threadId, 0);
              }
            }
          });

          this.recomputeUnread();
        });

        this.unreadUnsubs.push(unsubscribe as () => void);
      });

    return () => {
      this.unreadUnsubs.forEach((u) => u());
      this.unreadUnsubs = [];
    };
  }

  markThreadSeen(threadId: string, timestamp?: number) {
    const ts = typeof timestamp === 'number' ? timestamp : Date.now();
    this.lastSeen.set(threadId, ts);
    this.recomputeUnread();
  }

  private recomputeUnread() {
    const userId = this.currentUserId;
    if (!userId) return;

    let hasUnread = false;
    this.latestThreads.forEach((thread, threadId) => {
      const lastSeen = this.lastSeen.get(threadId) || 0;
      if (thread.updatedAt > lastSeen && thread.lastSenderId !== userId) {
        hasUnread = true;
      }
    });

    this.unreadSubject.next(hasUnread);
  }
}
