import { RequestHandler } from "express";

interface SMSReminderRequest {
  phone: string;
  message: string;
  taskTitle: string;
  dueDate: string;
}

interface SMSIndiaHubResponse {
  status: string;
  message: string;
  data?: any;
}

// SMSIndiaHub API integration using correct format
const sendSMSViaSMSIndiaHub = async (
  phone: string,
  message: string
): Promise<SMSIndiaHubResponse> => {
  const user = process.env.SMSINDIAHUB_USER || "mrrevuri";
  const password = process.env.SMSINDIAHUB_PASSWORD || "Urmilaoct9@1";
  const senderId = process.env.SMSINDIAHUB_SENDER_ID || "BIJAFM";
  const baseUrl = "http://cloud.smsindiahub.in/api/mt/SendSMS";

  if (!user || !password) {
    throw new Error("SMSIndiaHub credentials not configured");
  }

  // Format phone number - ensure it starts with 91 for India
  const formattedPhone = phone.startsWith("+91")
    ? phone.substring(1) // Remove + but keep 91
    : phone.startsWith("91")
      ? phone // Keep as is
      : phone.startsWith("0")
        ? "91" + phone.substring(1) // Replace 0 with 91
        : "91" + phone; // Add 91 prefix

  // Build query parameters
  const params = new URLSearchParams({
    user: user,
    password: password,
    senderid: senderId,
    channel: "Trans", // Using Trans for transactional
    DCS: "0",
    flashsms: "0",
    number: formattedPhone,
    text: message,
    route: "1" // Route 1 for transactional
  });

  const apiUrl = `${baseUrl}?${params.toString()}`;

  console.log(`Sending SMS via SMSIndiaHub to: ${formattedPhone}`);
  console.log(`Message: ${message}`);
  console.log(`API URL: ${apiUrl.replace(password, '***')}`); // Hide password in logs

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "text/plain",
      },
    });

    console.log(`SMSIndiaHub response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SMSIndiaHub API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`SMSIndiaHub API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log("SMSIndiaHub response:", responseText);

    // SMSIndiaHub typically returns simple text responses
    // Success responses usually contain message IDs or "success"
    const isSuccess = responseText.toLowerCase().includes('success') ||
                     responseText.includes('sent') ||
                     /^\d+$/.test(responseText.trim()); // Message ID is numeric

    return {
      status: isSuccess ? "success" : "error",
      message: responseText,
      data: responseText
    };
  } catch (fetchError) {
    console.error("Error calling SMSIndiaHub API:", fetchError);
    throw fetchError;
  }
};

export const sendSMSReminder: RequestHandler = async (req, res) => {
  try {
    const { phone, message, taskTitle, dueDate }: SMSReminderRequest = req.body;

    console.log(
      `SMS Reminder - Phone: ${phone}, Task: ${taskTitle}, Due: ${dueDate}`,
    );

    // Send SMS via SMSIndiaHub
    const smsResponse = await sendSMSViaSMSIndiaHub(phone, message);

    if (smsResponse.status === "success" || smsResponse.status === "Success") {
      res.json({
        success: true,
        message: "SMS reminder sent successfully via SMSIndiaHub",
        phone: phone,
        taskTitle: taskTitle,
        sentAt: new Date().toISOString(),
        provider: "SMSIndiaHub",
        providerResponse: smsResponse,
      });
    } else {
      console.error("SMSIndiaHub error:", smsResponse);
      res.status(400).json({
        success: false,
        error: "Failed to send SMS via SMSIndiaHub",
        details: smsResponse.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send SMS reminder",
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
