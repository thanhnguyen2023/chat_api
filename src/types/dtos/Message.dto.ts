import { Attachment } from "../entites/Attachment";
import { Message } from "../entites/Message";
import { Sender } from "./User.dto";

export type LastMessage = Pick<Message,'message_id'| 'content' | 'created_at'> & {
    sender : Sender
}

export type MessageDto = Message & {
    sender : Sender,
    attachments: Attachment[] | [],
    statuses: [],
}
// data mẫu response /api/messages/conversation/1
// const a = {
//   data: {
//     messages: [
//       {
//         message_id: 2,
//         conversation_id: 1,
//         sender_id: 2,
//         content: "Hi Alice! I'm doing great, thanks for asking. How about you?",
//         created_at: "2025-09-18T09:05:14.000Z",
//         is_read: false,
//         sender: {
//           user_id: 2,
//           username: "bob",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
//         },
//         attachments: [],
//         statuses: [],
//       },
//       {
//         message_id: 1,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "Hey Bob! How are you doing?",
//         created_at: "2025-09-18T09:05:14.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [],
//       },
//       {
//         message_id: 9,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "abc",
//         created_at: "2025-09-23T13:55:20.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [
//           {
//             status_id: 1,
//             message_id: 9,
//             receiver_id: 2,
//             status: "sent",
//             updated_at: "2025-09-23T13:55:20.000Z",
//             receiver: {
//               user_id: 2,
//               username: "bob",
//             },
//           },
//         ],
//       },
//       {
//         message_id: 10,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "abc",
//         created_at: "2025-09-23T13:58:15.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [
//           {
//             status_id: 2,
//             message_id: 10,
//             receiver_id: 2,
//             status: "sent",
//             updated_at: "2025-09-23T13:58:15.000Z",
//             receiver: {
//               user_id: 2,
//               username: "bob",
//             },
//           },
//         ],
//       },
//       {
//         message_id: 11,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "xin chao 999",
//         created_at: "2025-10-19T14:00:08.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [
//           {
//             status_id: 3,
//             message_id: 11,
//             receiver_id: 2,
//             status: "sent",
//             updated_at: "2025-10-19T14:00:08.000Z",
//             receiver: {
//               user_id: 2,
//               username: "bob",
//             },
//           },
//         ],
//       },
//       {
//         message_id: 12,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "xin chao 888",
//         created_at: "2025-10-19T14:00:47.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [
//           {
//             status_id: 4,
//             message_id: 12,
//             receiver_id: 2,
//             status: "sent",
//             updated_at: "2025-10-19T14:00:47.000Z",
//             receiver: {
//               user_id: 2,
//               username: "bob",
//             },
//           },
//         ],
//       },
//       {
//         message_id: 13,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "xin chao 1",
//         created_at: "2025-10-19T14:05:18.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [
//           {
//             status_id: 5,
//             message_id: 13,
//             receiver_id: 2,
//             status: "sent",
//             updated_at: "2025-10-19T14:05:18.000Z",
//             receiver: {
//               user_id: 2,
//               username: "bob",
//             },
//           },
//         ],
//       },
//       {
//         message_id: 14,
//         conversation_id: 1,
//         sender_id: 1,
//         content: "test data",
//         created_at: "2025-10-19T14:15:41.000Z",
//         is_read: false,
//         sender: {
//           user_id: 1,
//           username: " aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa",
//           avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
//         },
//         attachments: [],
//         statuses: [
//           {
//             status_id: 6,
//             message_id: 14,
//             receiver_id: 2,
//             status: "sent",
//             updated_at: "2025-10-19T14:15:41.000Z",
//             receiver: {
//               user_id: 2,
//               username: "bob",
//             },
//           },
//         ],
//       },
//     ],
//     pagination: {
//       current_page: 1,
//       total_pages: 1,
//       total_count: 8,
//       per_page: 50,
//       has_more: false,
//     },
//   },
// };
