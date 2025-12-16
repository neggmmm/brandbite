import { chatModel } from "../../config/ai.js";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import * as conversationManager from "./conversationManager.js";
import {
  allTools,
  greetingTools,
  browsingTools,
  orderingTools,
  checkoutTools,
  paymentTools,
  supportTools,
} from "./aiTools.js";

// ============================================================
// SYSTEM PROMPTS
// ============================================================

const BASE_SYSTEM_PROMPT = `You are a smart restaurant assistant.

CRITICAL: NEVER write function/tool names like "<function=X>" in your text. Call tools properly, don't mention them.

CORE RULES:
1. Be friendly, concise, and helpful
2. Default to ENGLISH. Only use Arabic if the user writes in Arabic.
3. Always use tools to get real data - NEVER make up prices, products, or info
4. Show images using Markdown: ![name](url)
5. For orders, always confirm product details before adding to cart
6. NEVER add items to cart unless the user explicitly asks

IMPORTANT:
- Do NOT add items without user confirmation
- When user asks for menu, use menu_search or get_categories
- Show product images when displaying products

PARTICIPANT INFO:
- ID: {participantId}
- Type: {participantType}
- Language: {language}`;

const STATE_PROMPTS = {
  greeting: `
Current State: GREETING
Your job: Greet the customer warmly. Ask how you can help.
Options: Browse menu, ask about restaurant, place order
Available actions: Search menu, get restaurant info, get categories`,

  browsing: `
Current State: BROWSING MENU  
Your job: Help customer explore the menu. Show products with images and prices.
When customer wants something specific, use add_to_cart tool.
Always confirm: product name, quantity, size/options if applicable.`,

  ordering: `
Current State: ORDERING
Your job: Help customer build their order.
- Use add_to_cart to add items (only when user confirms)
- Use update_cart_item to modify quantities
- Use get_cart to show current cart
When customer says they're done, move to cart review.`,

  cart_review: `
Current State: CART REVIEW
Your job: Show cart summary and ask if customer wants to:
1. Add more items
2. Modify quantities  
3. Proceed to checkout`,

  service_type: `
Current State: SERVICE TYPE SELECTION
Your job: Ask customer how they want their order:
- Dine-in: Need table number
- Pickup: No extra info needed
- Delivery: Need delivery address`,

  delivery_info: `
Current State: COLLECTING DELIVERY INFO
Your job: Get customer's delivery address.`,

  table_info: `
Current State: COLLECTING TABLE NUMBER
Your job: Get the table number from customer.`,

  coupon: `
Current State: COUPON CHECK
Your job: Ask if customer has a coupon or promo code.`,

  order_summary: `
Current State: ORDER SUMMARY
Your job: Show complete order summary. Ask customer to confirm.`,

  payment: `
Current State: PAYMENT
Your job: Ask payment method:
- Online: Will redirect to Stripe payment page
- In-store: Customer pays at cashier`,

  completed: `
Current State: ORDER COMPLETED
Your job: Thank the customer and provide order number.`,
};

// ============================================================
// TOOL SELECTION BY STATE
// ============================================================
function getToolsForState(state) {
  switch (state) {
    case "greeting":
      return greetingTools;
    case "browsing":
      return browsingTools;
    case "ordering":
    case "cart_review":
      return orderingTools;
    case "service_type":
    case "delivery_info":
    case "table_info":
    case "coupon":
    case "order_summary":
      return checkoutTools;
    case "payment":
      return paymentTools;
    case "completed":
      return greetingTools;
    default:
      return allTools;
  }
}

// ============================================================
// STATE TRANSITION LOGIC
// ============================================================
function determineNextState(currentState, aiResponse, toolResults) {
  const responseText = aiResponse?.content?.toLowerCase() || "";
  const hasOrderCreated = toolResults.some(t => t.name === "create_order" && t.success);
  const hasPaymentInitiated = toolResults.some(t => t.name === "initiate_payment" && t.success);
  const hasAddedToCart = toolResults.some(t => t.name === "add_to_cart" && t.success);

  if (currentState === "completed") return "greeting";
  if (hasPaymentInitiated) return "completed";
  if (hasOrderCreated) return "completed";
  if (hasAddedToCart && (currentState === "greeting" || currentState === "browsing")) return "ordering";

  if (currentState === "greeting") {
    if (responseText.includes("menu") || responseText.includes("منيو")) return "browsing";
  }

  if (currentState === "ordering" || currentState === "cart_review") {
    if (responseText.includes("checkout") || responseText.includes("خلصت")) return "service_type";
  }

  if (currentState === "service_type") {
    if (responseText.includes("delivery") || responseText.includes("توصيل")) return "delivery_info";
    if (responseText.includes("dine") || responseText.includes("داخل")) return "table_info";
    if (responseText.includes("pickup") || responseText.includes("استلام")) return "coupon";
  }

  if (currentState === "delivery_info" || currentState === "table_info") return "coupon";
  if (currentState === "coupon") return "order_summary";

  if (currentState === "order_summary") {
    if (responseText.includes("confirm") || responseText.includes("أكد")) return "payment";
  }

  return currentState;
}

// ============================================================
// BUILD MESSAGES FOR LLM
// ============================================================
function buildMessages(session, userMessage) {
  const systemPrompt = BASE_SYSTEM_PROMPT
    .replace("{participantId}", session.participantId)
    .replace("{participantType}", session.participantType)
    .replace("{language}", session.language || "en")
    + "\n" + (STATE_PROMPTS[session.state] || STATE_PROMPTS.greeting);

  const messages = [new SystemMessage(systemPrompt)];

  const history = session.getRecentMessages(10);
  for (const msg of history) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    } else if (msg.role === "tool") {
      messages.push(
        new ToolMessage({
          tool_call_id: msg.toolCallId || "unknown",
          content: msg.content,
          name: msg.toolName || "unknown",
        })
      );
    }
  }

  messages.push(new HumanMessage(userMessage));
  return messages;
}

// ============================================================
// EXECUTE TOOLS
// ============================================================
async function executeTools(toolCalls, session) {
  const results = [];

  for (const toolCall of toolCalls) {
    console.log(`[Chat] Executing tool: ${toolCall.name}`);

    let result = "";
    let parsed = null;

    try {
      const args = { ...toolCall.args };
      if (!args.participantId && toolCall.name !== "restaurant_info" && toolCall.name !== "website_guide") {
        args.participantId = session.participantId;
        args.participantType = session.participantType;
        if (session.user) {
          args.userId = session.user.toString();
        }
      }

      const tools = allTools;
      const tool = tools.find((t) => t.name === toolCall.name);

      if (tool) {
        result = await tool.invoke(args);
        try {
          parsed = JSON.parse(result);
        } catch {
          parsed = { raw: result };
        }
      } else {
        result = JSON.stringify({ error: `Tool ${toolCall.name} not found` });
        parsed = { error: true };
      }
    } catch (error) {
      console.error(`[Chat] Tool ${toolCall.name} failed:`, error);
      result = JSON.stringify({ error: error.message });
      parsed = { error: true };
    }

    results.push({
      id: toolCall.id,
      name: toolCall.name,
      result,
      ...parsed,
    });
  }

  return results;
}

// ============================================================
// MAIN CHAT PROCESSOR
// ============================================================
export async function processUserMessage(userMessage, sessionId, participantId, participantType = "guest", userId = null) {
  try {
    console.log(`\n[Chat] ========== New Message ==========`);
    console.log(`[Chat] Session: ${sessionId}, Participant: ${participantId}`);
    console.log(`[Chat] Message: "${userMessage}"`);

    const session = await conversationManager.getOrCreateSession(
      sessionId,
      participantId,
      participantType,
      userId
    );

    // Detect language - default to English, only switch if Arabic detected
    const detectedLang = conversationManager.detectLanguage(userMessage);
    if (detectedLang === "ar" && session.language !== "ar") {
      await conversationManager.updateLanguage(sessionId, "ar");
      session.language = "ar";
    } else if (!session.language) {
      session.language = "en";
    }

    console.log(`[Chat] Current state: ${session.state}, Language: ${session.language}`);

    const messages = buildMessages(session, userMessage);
    const tools = getToolsForState(session.state);
    const llmWithTools = chatModel.bindTools(tools);

    console.log(`[Chat] Calling LLM with ${tools.length} tools...`);
    let aiResponse = await llmWithTools.invoke(messages);

    let iterations = 5;
    const allToolResults = [];

    while (aiResponse.tool_calls && aiResponse.tool_calls.length > 0 && iterations > 0) {
      iterations--;
      console.log(`[Chat] AI wants to call ${aiResponse.tool_calls.length} tool(s)`);

      const toolResults = await executeTools(aiResponse.tool_calls, session);
      allToolResults.push(...toolResults);

      messages.push(aiResponse);
      for (const result of toolResults) {
        messages.push(
          new ToolMessage({
            tool_call_id: result.id,
            content: result.result,
            name: result.name,
          })
        );
      }

      aiResponse = await llmWithTools.invoke(messages);
    }

    await conversationManager.addMessage(sessionId, "user", userMessage);
    await conversationManager.addMessage(sessionId, "assistant", aiResponse.content);

    for (const result of allToolResults) {
      await conversationManager.addMessage(sessionId, "tool", result.result, result.name, result.id);
    }

    const nextState = determineNextState(session.state, aiResponse, allToolResults);
    if (nextState !== session.state) {
      console.log(`[Chat] State transition: ${session.state} -> ${nextState}`);
      await conversationManager.updateState(sessionId, nextState);
    }

    let action = null;
    let actionData = null;

    const orderCreation = allToolResults.find((r) => r.name === "create_order" && r.success);
    if (orderCreation) {
      action = "order_created";
      actionData = {
        orderId: orderCreation.orderId,
        orderNumber: orderCreation.orderNumber,
        totalAmount: orderCreation.totalAmount,
      };
    }

    const paymentInit = allToolResults.find((r) => r.name === "initiate_payment" && r.success);
    if (paymentInit) {
      action = "payment_redirect";
      actionData = {
        checkoutUrl: paymentInit.checkoutUrl,
        sessionId: paymentInit.sessionId,
      };
    }

    console.log(`[Chat] Response: "${aiResponse.content?.substring(0, 100)}..."`);

    return {
      success: true,
      answer: aiResponse.content,
      state: nextState,
      action,
      actionData,
      sessionId: session.sessionId,
    };
  } catch (error) {
    console.error("[Chat Service Error]", error);
    return {
      success: false,
      answer: "Sorry, an error occurred. Please try again.",
      error: error.message,
    };
  }
}

// ============================================================
// GET SESSION INFO (for loading chat history)
// ============================================================
export async function getSessionInfo(sessionId) {
  try {
    const session = await conversationManager.getSession(sessionId);
    if (!session) {
      return { success: true, messages: [], state: "greeting" };
    }

    const messages = session.messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({
        type: m.role === "user" ? "user" : "bot",
        content: m.content,
        time: m.timestamp?.toISOString() || new Date().toISOString(),
      }));

    return {
      success: true,
      messages,
      state: session.state || "greeting",
    };
  } catch (error) {
    console.error("[getSessionInfo Error]", error);
    return { success: true, messages: [], state: "greeting" };
  }
}

// ============================================================
// RESET CONVERSATION
// ============================================================
export async function resetConversation(sessionId) {
  try {
    await conversationManager.resetSession(sessionId);
    return { success: true, message: "Conversation reset successfully" };
  } catch (error) {
    console.error("[resetConversation Error]", error);
    return { success: false, error: error.message };
  }
}