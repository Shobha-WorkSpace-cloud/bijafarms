import { RequestHandler } from "express";

interface WhatsAppReminderRequest {
  phone: string;
  message: string;
  taskTitle: string;
  dueDate: string;
}

interface WhatsAppResponse {
  success: boolean;
  message: string;
  whatsappUrl?: string;
  data?: any;
}

// WhatsApp Web URL generator for farm task reminders
const generateWhatsAppURL = (phone: string, message: string): string => {
  // Format phone number - ensure it starts with 91 for India (without +)
  const formattedPhone = phone.startsWith("+91")
    ? phone.substring(1) // Remove + but keep 91
    : phone.startsWith("91")
      ? phone // Keep as is
      : phone.startsWith("0")
        ? "91" + phone.substring(1) // Replace 0 with 91
        : "91" + phone; // Add 91 prefix

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // Generate WhatsApp Web URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  console.log(`Generated WhatsApp URL for: ${formattedPhone}`);
  console.log(`Message: ${message}`);

  return whatsappUrl;
};

// Send WhatsApp reminder (generates URL for manual sending)
const sendWhatsAppReminder = async (
  phone: string,
  message: string
): Promise<WhatsAppResponse> => {
  try {
    const whatsappUrl = generateWhatsAppURL(phone, message);

    return {
      success: true,
      message: "WhatsApp URL generated successfully",
      whatsappUrl: whatsappUrl,
      data: {
        phone: phone,
        formattedPhone: phone.startsWith("+91") ? phone.substring(1) : phone,
        message: message
      }
    };
  } catch (error) {
    console.error("Error generating WhatsApp URL:", error);
    return {
      success: false,
      message: "Failed to generate WhatsApp URL",
      data: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const sendWhatsAppReminderEndpoint: RequestHandler = async (req, res) => {
  try {
    const { phone, message, taskTitle, dueDate }: WhatsAppReminderRequest = req.body;

    console.log(
      `WhatsApp Reminder - Phone: ${phone}, Task: ${taskTitle}, Due: ${dueDate}`,
    );

    // Generate WhatsApp URL
    const whatsappResponse = await sendWhatsAppReminder(phone, message);

    if (whatsappResponse.success) {
      res.json({
        success: true,
        message: "WhatsApp reminder URL generated successfully",
        phone: phone,
        taskTitle: taskTitle,
        generatedAt: new Date().toISOString(),
        provider: "WhatsApp",
        whatsappUrl: whatsappResponse.whatsappUrl,
        providerResponse: whatsappResponse,
      });
    } else {
      console.error("WhatsApp error:", whatsappResponse);
      res.status(400).json({
        success: false,
        error: "Failed to generate WhatsApp URL",
        details: whatsappResponse.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error generating WhatsApp reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate WhatsApp reminder",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Test SMS endpoint to validate SMSIndiaHub integration
// Simple test SMS endpoint with minimal error handling
export const sendTestSMSSimple: RequestHandler = async (req, res) => {
  console.log("=== Simple Test SMS Request ===");

  // Set proper headers
  res.setHeader('Content-Type', 'application/json');

  try {
    const testMessage = `TEST: Bija Farms SMS working! ${new Date().toLocaleTimeString()}`;
    console.log("Test message:", testMessage);

    // Simple success response for now
    res.status(200).json({
      success: true,
      message: "Test SMS endpoint working",
      phone: "+919985442209",
      testMessage: testMessage,
      sentAt: new Date().toISOString(),
      provider: "SMSIndiaHub"
    });

  } catch (error) {
    console.error("Simple test error:", error);
    res.status(500).json({
      success: false,
      error: "Test failed",
      details: String(error)
    });
  }
};

export const sendTestSMS: RequestHandler = async (req, res) => {
  try {
    console.log("=== Test SMS Request Started ===");
    console.log("User available:", !!process.env.SMSINDIAHUB_USER);
    console.log("Password available:", !!process.env.SMSINDIAHUB_PASSWORD);
    console.log("Sender ID:", process.env.SMSINDIAHUB_SENDER_ID);

    const testMessage = `TEST MESSAGE from Bija Farms: SMSIndiaHub integration is working! Sent at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    console.log("Sending test SMS to +919985442209...");
    console.log("Test message:", testMessage);

    const smsResponse = await sendSMSViaSMSIndiaHub("+919985442209", testMessage);
    console.log("SMS Response received:", smsResponse);

    // Check various success indicators
    const isSuccess = smsResponse.status === "success" ||
                     smsResponse.status === "Success" ||
                     smsResponse.status === "OK" ||
                     (smsResponse.code && smsResponse.code === "200");

    if (isSuccess) {
      console.log("✅ Test SMS sent successfully");
      res.json({
        success: true,
        message: "Test SMS sent successfully via SMSIndiaHub",
        phone: "+919985442209",
        testMessage: testMessage,
        sentAt: new Date().toISOString(),
        provider: "SMSIndiaHub",
        providerResponse: smsResponse,
      });
    } else {
      console.error("❌ SMSIndiaHub test error:", smsResponse);
      res.status(400).json({
        success: false,
        error: "Failed to send test SMS via SMSIndiaHub",
        details: smsResponse.message || smsResponse.description || "Unknown error",
        providerResponse: smsResponse,
      });
    }
  } catch (error) {
    console.error("❌ Error sending test SMS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send test SMS",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const scheduleReminder: RequestHandler = async (req, res) => {
  try {
    const { taskId, title, dueDate, description } = req.body;

    // Calculate reminder date (1 day before due date)
    const dueDateObj = new Date(dueDate);
    const reminderDate = new Date(dueDateObj);
    reminderDate.setDate(reminderDate.getDate() - 1);

    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    // If reminder date is in the past or today, send immediately
    if (timeUntilReminder <= 0) {
      const message = `URGENT: Farm task "${title}" is due ${dueDate === now.toISOString().split("T")[0] ? "TODAY" : "OVERDUE"}! Please complete: ${description}`;

      // Send immediate SMS via SMSIndiaHub
      try {
        const smsResponse = await sendSMSViaSMSIndiaHub("+919985442209", message);

        return res.json({
          success: true,
          message: "Immediate reminder sent via SMSIndiaHub (task is due soon)",
          scheduledFor: "immediate",
          provider: "SMSIndiaHub",
          smsStatus: smsResponse.status,
        });
      } catch (error) {
        console.error("Failed to send immediate SMS:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to send immediate SMS reminder",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Schedule reminder for 1 day before
    setTimeout(async () => {
      const message = `Reminder: Farm task "${title}" is due tomorrow (${dueDate}). Description: ${description}. Please prepare accordingly.`;

      try {
        await sendSMSViaSMSIndiaHub("+919985442209", message);
        console.log(`SMS reminder sent via SMSIndiaHub for task: ${title}`);
      } catch (error) {
        console.error(`Failed to send SMS reminder for task ${title}:`, error);
      }
    }, timeUntilReminder);

    res.json({
      success: true,
      message: "Reminder scheduled successfully",
      taskId,
      scheduledFor: reminderDate.toISOString(),
      timeUntilReminder:
        Math.round(timeUntilReminder / (1000 * 60 * 60)) + " hours",
    });
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to schedule reminder",
    });
  }
};
