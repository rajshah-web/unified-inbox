import { Conversation } from "@/store/useAppStore";

export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    page_id: "page_1",
    page_name: "VegasSweep",
    messages: {
      data: [
        {
          id: "msg_1",
          text: "Hey, I need help with my account.",
          from: { id: "user_1", name: "Alice Johnson" },
          to: { data: [{ id: "page_1", name: "VegasSweep" }] },
          created_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        },
        {
          id: "msg_2",
          text: "Sure, I can help you with that. What is your account ID?",
          from: { id: "page_1", name: "VegasSweep" },
          to: { data: [{ id: "user_1", name: "Alice Johnson" }] },
          created_time: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        },
        {
          id: "msg_3",
          text: "My ID is 778899. I can't seem to reset my password.",
          from: { id: "user_1", name: "Alice Johnson" },
          to: { data: [{ id: "page_1", name: "VegasSweep" }] },
          created_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        }
      ]
    },
    participants: {
      data: [{ id: "user_1", name: "Alice Johnson" }, { id: "page_1", name: "VegasSweep" }]
    },
    updated_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "conv_2",
    page_id: "page_2",
    page_name: "Firekirin",
    messages: {
      data: [
        {
          id: "msg_4",
          text: "Do you have any promotions running today?",
          from: { id: "user_2", name: "Bob Smith" },
          to: { data: [{ id: "page_2", name: "Firekirin" }] },
          created_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        }
      ]
    },
    participants: {
      data: [{ id: "user_2", name: "Bob Smith" }, { id: "page_2", name: "Firekirin" }]
    },
    updated_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "conv_3",
    page_id: "page_1",
    page_name: "VegasSweep",
    messages: {
      data: [
        {
          id: "msg_5",
          text: "Thank you for the fast payout!",
          from: { id: "user_3", name: "Charlie Davis" },
          to: { data: [{ id: "page_1", name: "VegasSweep" }] },
          created_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        }
      ]
    },
    participants: {
      data: [{ id: "user_3", name: "Charlie Davis" }, { id: "page_1", name: "VegasSweep" }]
    },
    updated_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];
