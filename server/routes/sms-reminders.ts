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

// SMSIndiaHub API integration
const sendSMSViaSMSIndiaHub = async (
  phone: string,
  message: string
): Promise<SMSIndiaHubResponse> => {
  const apiKey = process.env.SMSINDIAHUB_API_KEY;
  const senderId = process.env.SMSINDIAHUB_SENDER_ID || "BIJAFM";
  const apiUrl = "https://api.smsindiahub.in/json/api.php";

  if (!apiKey) {
    throw new Error("SMSIndiaHub API key not configured");
  }

  // Format phone number - ensure it starts with 91 for India
  const formattedPhone = phone.startsWith("+91")
    ? phone.substring(3)
    : phone.startsWith("91")
      ? phone.substring(2)
      : phone.startsWith("0")
        ? phone.substring(1)
        : phone;

  const requestBody = {
    key: apiKey,
    campaign: "1", // 1 for transactional, 0 for promotional
    routeid: "1", // Route ID (1 for transactional route)
    type: "text",
    contacts: formattedPhone,
    senderid: senderId,
    msg: message,
  };

  console.log(`Sending SMS via SMSIndiaHub to: ${formattedPhone}`);
  console.log(`Message: ${message}`);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`SMSIndiaHub API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
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
export const sendTestSMS: RequestHandler = async (req, res) => {
  try {
    const testMessage = `🧪 TEST MESSAGE from Bija Farms: SMSIndiaHub integration is working! Sent at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    console.log("Sending test SMS to +919985442209...");

    const smsResponse = await sendSMSViaSMSIndiaHub("+919985442209", testMessage);

    if (smsResponse.status === "success" || smsResponse.status === "Success") {
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
      console.error("SMSIndiaHub test error:", smsResponse);
      res.status(400).json({
        success: false,
        error: "Failed to send test SMS via SMSIndiaHub",
        details: smsResponse.message || "Unknown error",
        providerResponse: smsResponse,
      });
    }
  } catch (error) {
    console.error("Error sending test SMS:", error);
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
