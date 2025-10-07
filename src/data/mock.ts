import { faker } from '@faker-js/faker';

// Helper to generate deterministic image URLs
const getImage = (seed: number, width = 600, height = 600) => `https://picsum.photos/seed/${seed}/${width}/${height}`;
const getAvatar = (seed: number) => `https://i.pravatar.cc/150?img=${seed}`;

interface User {
  id: string;
  username: string;
  avatar: string;
  fullName: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  isVerified: boolean;
}

interface Story {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  imageUrl: string;
  timestamp: string;
  isSeen: boolean;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  location?: string;
  images: string[];
  caption: string;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  timestamp: string;
  isBookmarked: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participants: [string, string]; // [currentUser.id, otherUser.id]
  messages: Message[];
  lastMessage: Message;
  otherUser: User;
}

// --- Mock Data Generation ---

const generateUser = (id: string, username: string, fullName: string, seed: number): User => ({
  id,
  username,
  avatar: getAvatar(seed),
  fullName,
  bio: faker.person.bio(),
  followers: faker.number.int({ min: 1000, max: 1000000 }),
  following: faker.number.int({ min: 50, max: 1000 }),
  postsCount: faker.number.int({ min: 10, max: 500 }),
  isVerified: faker.datatype.boolean(0.3),
});

const users: User[] = [
  generateUser('user1', 'johndoe', 'John Doe', 1),
  generateUser('user2', 'janedoe', 'Jane Doe', 2),
  generateUser('user3', 'alexsmith', 'Alex Smith', 3),
  generateUser('user4', 'emilyjones', 'Emily Jones', 4),
  generateUser('user5', 'michaelbrown', 'Michael Brown', 5),
  generateUser('user6', 'sarahdavis', 'Sarah Davis', 6),
  // generateUser('user7', 'davidwilson', 'David Wilson', 7),
  // generateUser('user8', 'oliviathomas', 'Olivia Thomas', 8),
  // generateUser('user9', 'chrislee', 'Chris Lee', 9),
  // generateUser('user10', 'sophiamartin', 'Sophia Martin', 10),
];

const currentUser: User = users[0]; // John Doe is the current user

const generateComment = (userId: string, postId: string, seed: number, depth = 0): Comment => {
  const user = faker.helpers.arrayElement(users);
  const commentId = faker.string.uuid();
  const repliesCount = depth < 2 ? faker.number.int({ min: 0, max: 2 }) : 0;
  return {
    id: commentId,
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    text: faker.lorem.sentence({ min: 5, max: 20 }),
    timestamp: faker.date.recent({ days: 7 }).toISOString(),
    likes: faker.number.int({ min: 0, max: 100 }),
    replies: Array.from({ length: repliesCount }).map(() => generateComment(faker.helpers.arrayElement(users).id, postId, faker.number.int(), depth + 1)),
  };
};

const generatePost = (id: string, userId: string, seed: number): Post => {
  const user = users.find(u => u.id === userId) || faker.helpers.arrayElement(users);
  const numImages = faker.number.int({ min: 1, max: 4 });
  const postId = faker.string.uuid();
  return {
    id: postId,
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    location: faker.location.city(),
    images: Array.from({ length: numImages }).map((_, i) => getImage(seed + i)),
    caption: faker.lorem.paragraph({ min: 1, max: 3 }),
    likes: faker.number.int({ min: 100, max: 5000 }),
    hasLiked: faker.datatype.boolean(0.7),
    comments: Array.from({ length: faker.number.int({ min: 2, max: 15 }) }).map(() => generateComment(faker.helpers.arrayElement(users).id, postId, faker.number.int())),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
    isBookmarked: faker.datatype.boolean(0.2),
  };
};

const posts: Post[] = Array.from({ length: 30 }).map((_, i) =>
  generatePost(faker.string.uuid(), faker.helpers.arrayElement(users).id, i + 100)
);

const stories: Story[] = users.map((user, i) => ({
  id: faker.string.uuid(),
  userId: user.id,
  username: user.username,
  avatar: user.avatar,
  imageUrl: getImage(i + 200, 400, 600),
  timestamp: faker.date.recent({ days: 1 }).toISOString(),
  isSeen: faker.datatype.boolean(0.6),
}));

const generateMessage = (senderId: string, receiverId: string, seed: number): Message => ({
  id: faker.string.uuid(),
  senderId,
  receiverId,
  text: faker.lorem.sentence({ min: 3, max: 15 }),
  timestamp: faker.date.recent({ days: 7 }).toISOString(),
  isRead: faker.datatype.boolean(0.8),
});

const conversations: Conversation[] = users
  .filter(user => user.id !== currentUser.id)
  .slice(0, 5) // Limit to 5 conversations for simplicity
  .map((otherUser, i) => {
    const messages: Message[] = Array.from({ length: faker.number.int({ min: 5, max: 20 }) }).map((_, j) => {
      const sender = j % 2 === 0 ? currentUser : otherUser;
      const receiver = j % 2 === 0 ? otherUser : currentUser;
      return generateMessage(sender.id, receiver.id, i * 100 + j);
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const lastMessage = messages[messages.length - 1];

    return {
      id: faker.string.uuid(),
      participants: [currentUser.id, otherUser.id],
      messages,
      lastMessage,
      otherUser,
    };
  });


export { users, currentUser, posts, stories, conversations, type User, type Story, type Post, type Comment, type Message, type Conversation };