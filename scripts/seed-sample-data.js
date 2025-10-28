const { User, Conversation, Message, Participant } = require("../models")
const bcrypt = require("bcryptjs")

async function seedSampleData() {
  try {
    console.log("🌱 Starting to seed sample data...")

    // Create sample users
    const users = await User.bulkCreate([
      {
        username: "alice",
        full_name: "Alice Johnson",
        gender: "female",
        is_private: 0,
        bio: "Loves chatting and coffee ☕",
        email: "alice@example.com",
        password: await bcrypt.hash("password123", 12),
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        status: "online",
        created_at: new Date(),
      },
      {
        username: "bob",
        full_name: "Bob Williams",
        gender: "male",
        is_private: 0,
        bio: "Tech enthusiast and gamer 🎮",
        email: "bob@example.com",
        password: await bcrypt.hash("password123", 12),
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        status: "offline",
        created_at: new Date(),
      },
      {
        username: "charlie",
        full_name: "Charlie Brown",
        gender: "male",
        is_private: 1,
        bio: "Backend developer and coffee lover ☕",
        email: "charlie@example.com",
        password: await bcrypt.hash("password123", 12),
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
        status: "busy",
        created_at: new Date(),
      },
      {
        username: "diana",
        full_name: "Diana Prince",
        gender: "female",
        is_private: 0,
        bio: "Designer and traveler 🌍",
        email: "diana@example.com",
        password: await bcrypt.hash("password123", 12),
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
        status: "online",
        created_at: new Date(),
      },
    ])

    console.log("✅ Created sample users")

    // Create sample conversations
    const conversations = await Conversation.bulkCreate([
      { conversation_name: null, is_group: false },
      { conversation_name: "Project Team", is_group: true },
      { conversation_name: "Friends Group", is_group: true },
    ])

    console.log("✅ Created sample conversations")

    // Add participants
    await Participant.bulkCreate([
      // Direct message Alice ↔ Bob
      { conversation_id: conversations[0].conversation_id, user_id: users[0].user_id },
      { conversation_id: conversations[0].conversation_id, user_id: users[1].user_id },

      // Project Team (Alice, Bob, Charlie)
      { conversation_id: conversations[1].conversation_id, user_id: users[0].user_id },
      { conversation_id: conversations[1].conversation_id, user_id: users[1].user_id },
      { conversation_id: conversations[1].conversation_id, user_id: users[2].user_id },

      // Friends Group (All users)
      { conversation_id: conversations[2].conversation_id, user_id: users[0].user_id },
      { conversation_id: conversations[2].conversation_id, user_id: users[1].user_id },
      { conversation_id: conversations[2].conversation_id, user_id: users[2].user_id },
      { conversation_id: conversations[2].conversation_id, user_id: users[3].user_id },
    ])

    console.log("✅ Added participants")

    // Create messages
    await Message.bulkCreate([
      {
        conversation_id: conversations[0].conversation_id,
        sender_id: users[0].user_id,
        content: "Hey Bob! How are you doing?",
      },
      {
        conversation_id: conversations[0].conversation_id,
        sender_id: users[1].user_id,
        content: "Hi Alice! I'm doing great, thanks. How about you?",
      },

      {
        conversation_id: conversations[1].conversation_id,
        sender_id: users[0].user_id,
        content: "Good morning team! Let's discuss today's tasks.",
      },
      {
        conversation_id: conversations[1].conversation_id,
        sender_id: users[2].user_id,
        content: "Morning Alice! I've completed the database design.",
      },
      {
        conversation_id: conversations[1].conversation_id,
        sender_id: users[1].user_id,
        content: "Great work Charlie! I'll review it today.",
      },

      {
        conversation_id: conversations[2].conversation_id,
        sender_id: users[3].user_id,
        content: "Anyone up for coffee this weekend?",
      },
      {
        conversation_id: conversations[2].conversation_id,
        sender_id: users[0].user_id,
        content: "Count me in! ☕",
      },
      {
        conversation_id: conversations[2].conversation_id,
        sender_id: users[1].user_id,
        content: "Sounds good to me!",
      },
    ])

    console.log("✅ Created sample messages")
    console.log("🎉 Sample data seeded successfully!")
    console.log("\nSample user credentials:")
    console.log("- alice@example.com / password123")
    console.log("- bob@example.com / password123")
    console.log("- charlie@example.com / password123")
    console.log("- diana@example.com / password123")
  } catch (error) {
    console.error("❌ Error seeding sample data:", error)
  }
}

// Run directly
if (require.main === module) {
  const sequelize = require("../config/sequelize")

  sequelize
    .authenticate()
    .then(() => {
      console.log("✅ Database connected")
      return seedSampleData()
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Database connection failed:", error)
      process.exit(1)
    })
}

module.exports = seedSampleData
