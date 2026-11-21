import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Post from '../models/Post.js';

const demoPassword = 'DemoPass123!';
const demoUsers = [
  'Avery Brooks', 'Jordan Lee', 'Morgan Patel', 'Taylor Kim', 'Riley Chen',
  'Casey Nguyen', 'Quinn Davis', 'Jamie Wilson', 'Skyler Martin', 'Alex Rivera',
  'Drew Thompson', 'Cameron White', 'Parker Garcia', 'Reese Anderson', 'Rowan Clark',
  'Emerson Lewis', 'Finley Walker', 'Sage Hall', 'Dakota Young', 'Robin Allen',
  'Kendall King', 'Elliot Wright', 'Blake Scott', 'Charlie Green', 'Hayden Baker'
];
const interestPool = [
  'art', 'cooking', 'fitness', 'gardening', 'health', 'history',
  'music', 'reading', 'science', 'technology', 'travel', 'writing'
];
const noteTopics = [
  'Daily reflection', 'Wellness goals', 'Weekly plan', 'Ideas to explore',
  'Things to remember', 'Reading notes', 'Personal checklist', 'Project thoughts',
  'Healthy habits', 'A moment of gratitude'
];
const postTopics = [
  'A small healthy habit', 'What I learned this week', 'A book worth sharing',
  'Making time to recharge', 'A useful everyday tip', 'A recent discovery',
  'Finding inspiration nearby', 'My weekend project', 'A favorite recipe',
  'One thing I am grateful for'
];

async function seedDemo() {
  await connectDB();

  const password = await bcrypt.hash(demoPassword, 12);
  const users = [];
  for (let index = 0; index < demoUsers.length; index += 1) {
    const email = `demo.user${String(index + 1).padStart(2, '0')}@example.test`;
    const interests = [0, 3, 6].map(offset => interestPool[(index + offset) % interestPool.length]);
    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name: demoUsers[index],
          email,
          password,
          role: 'user',
          interests
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    users.push(user);
  }

  const noteOperations = [];
  const postOperations = [];
  for (const user of users) {
    for (let itemIndex = 0; itemIndex < 10; itemIndex += 1) {
      const noteTitle = `${noteTopics[itemIndex]} ${String(itemIndex + 1).padStart(2, '0')}`;
      noteOperations.push({
        updateOne: {
          filter: { userId: user._id, title: noteTitle },
          update: {
            $setOnInsert: {
              userId: user._id,
              title: noteTitle,
              content: `A sample private note for ${user.name}. Use it to try editing and deleting notes.`
            }
          },
          upsert: true
        }
      });

      const postTitle = `${postTopics[itemIndex]} ${String(itemIndex + 1).padStart(2, '0')}`;
      postOperations.push({
        updateOne: {
          filter: { userId: user._id, title: postTitle },
          update: {
            $setOnInsert: {
              userId: user._id,
              title: postTitle,
              content: `A sample public post by ${user.name}, created for testing the public feed and author pagination.`
            }
          },
          upsert: true
        }
      });
    }
  }

  await Note.bulkWrite(noteOperations, { ordered: false });
  await Post.bulkWrite(postOperations, { ordered: false });
  console.log(`Demo data ready: ${users.length} users, ${noteOperations.length} notes, and ${postOperations.length} posts.`);
  console.log(`Demo login: demo.user01@example.test / ${demoPassword}`);
  console.log('The seeder only inserts missing demo records; it does not overwrite existing data.');
}

try {
  await seedDemo();
} catch (error) {
  console.error('Failed to seed demo data:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
